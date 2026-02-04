# SSE Real-time Chat Application

A modern chat application showcasing **Server-Sent Events (SSE)** for real-time capabilities. Built with MERN stack (MongoDB, Express, React, Node.js).

## Project Overview

This project demonstrates how to build a scalable, real-time chat system without using WebSockets. It uses simple HTTP long-lived connections (SSE) to push updates from server to client.

### Features

- **Real-time Messaging**: Instant updates for all participants.
- **Room Management**: Create, join, and close rooms.
- **Hybrid Auth**: Supports both authenticated users and guests.
- **Resilience**: Auto-reconnection and status indicators.

## Architecture: Why SSE?

### WebSocket vs Server-Sent Events (SSE)

| Feature          | WebSocket                      | SSE                               |
| ---------------- | ------------------------------ | --------------------------------- |
| **Direction**    | Bidirectional (Full-duplex)    | Unidirectional (Server -> Client) |
| **Protocol**     | Custom TCP Protocol            | Standard HTTP                     |
| **Complexity**   | High (Handshakes, upgrades)    | Low (Simple HTTP Request)         |
| **Firewalls**    | Often blocked                  | Friendly (Standard HTTP/80/443)   |
| **Reconnection** | Manual implementation required | Built-in browser support          |

### How SSE Helps Scale

1.  **Stateless(ish) Load Balancing**: Since SSE uses standard HTTP, it plays much nicer with standard Load Balancers (Layer 7) compared to WebSockets which require sticky sessions and connection upgrades.
2.  **Resource Usage**: Can be lighter on the server for scenarios with high read/low write ratios (like chat rooms where many listen but few type at once).
3.  **Simplicity**: scaling standard HTTP services is a well-solved problem using generic tools (Nginx, HAProxy).

### Offline Handling & Resilience

- **Server Offline**: Since the application is built on HTTP, if the server goes offline, the client simply pauses.
- **Auto-Reconnect**: The client's `EventSource` API automatically attempts to reconnect.
- **State Preservation**: The client retains the chat history. When the server comes back up, the connection is re-established transparently, and the user can continue where they left off without refreshing.

## Getting Started

1.  **Start Database**: Ensure MongoDB is running (`mongod`).
2.  **Start Server**:
    ```bash
    cd server
    npm install
    npm run dev
    ```
3.  **Start Client**:
    ```bash
    cd client
    npm install
    npm run dev
    ```
4.  Open `http://localhost:5173`.
