# Architecture & Scaling Guide

This document explains the technical implementation of horizontal scalability and production readiness for the application.

## 1. The Redis Pub/Sub Architecture

The application is designed to be **stateless** regarding message distribution. It does not rely on a single server instance to hold the entire world state.

### Message Flow Diagram

```
[User A] --(POST Message)--> [Load Balancer] --> [Server Node 1]
                                                      |
                                                 (Publish)
                                                      v
                                              [Redis Channel]
                                                      |
                                    +-----------------+-----------------+
                                    |                                   |
                               (Subscribe)                         (Subscribe)
                                    v                                   v
                             [Server Node 1]                     [Server Node 2]
                                    |                                   |
                               (SSE Push)                          (SSE Push)
                                    v                                   v
                                [User A]                            [User B]
```

### Why this matters

Without Redis, you are limited to the CPU and RAM of a single server (Vertical Scaling). With this architecture, you can add as many servers as needed (Horizontal Scaling) to handle increasing load.

## 2. Production Deployment Considerations

To run this application in a production environment (AWS, GCP, DigitalOcean), you must address the following:

### A. HTTP/2 (Multiplexing)

**The Problem**: Browsers limit **HTTP/1.1** connections to ~6 per domain. Since SSE keeps a connection open 24/7, a user with 6 tabs open will be blocked from loading any other assets.
**The Fix**: Use **HTTP/2**.

- TCP connections are reused.
- Multiple streams (SSE requests) can share a single connection.
- **Config**: Ensure your Load Balancer (Nginx, ALB, Cloudflare) is configured for HTTP/2.

### B. Heartbeats & Timeouts

**The Problem**: Infrastructure components (Load Balancers, Firewalls) often kill "idle" TCP connections that haven't transmitted data for 60 seconds.
**The Fix**:

1.  **Server-Side**: The application should send a "ping" or comment line (`: keepalive`) down the SSE stream every 30-45 seconds.
2.  **Infrastructure-Side**: Configure Nginx proxy read timeouts to likely values (e.g., 24 hours).
    ```nginx
    proxy_read_timeout 24h;
    proxy_buffering off;
    ```

### C. Buffer Limits

For extremely high-throughput chat rooms (100k+ users), writing every message individually to MongoDB can become a bottleneck.
**Optimization**:

- Use Redis to **cache** recent messages in a List.
- Use a background worker to **batch write** these messages to MongoDB every few seconds (Write-Behind pattern).
