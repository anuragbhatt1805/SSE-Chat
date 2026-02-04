# Real-time Chat Application (SSE + Redis)

A robust, scalable chat application built with the MERN stack (MongoDB, Express, React, Node.js), demonstrating the power of **Server-Sent Events (SSE)** for real-time communication.

## 🧐 Why Server-Sent Events (SSE)?

Most chat applications use **WebSockets** for bidirectional communication. However, for many use cases, **SSE** is a superior architectural choice.

### Real-time Technology Comparison

| Feature | Server-Sent Events (SSE) | WebSockets | Long Polling | Why we chose SSE |
| :--- | :--- | :--- | :--- | :--- |
| **Communication** | **Unidirectional** (Server -> Client) | **Bidirectional** (Full Duplex) | **Unidirectional** (Request -> Wait -> Response) | Chat apps primarily _receive_ streams. Sending via HTTP POST is adequate. |
| **Protocol** | **Standard HTTP** | TCP Upgrade | Standard HTTP | Works seamlessly with existing HTTP infrastructure (LB, Auth). |
| **Reconnection** | **Automatic** (Built-in) | Manual Implementation | Manual Implementation | Native `EventSource` handles retries automatically. |
| **Latency** | Low (Real-time) | Lowest (Real-time) | Medium/High (Overhead) | Balanced latency/complexity trade-off. |

### detailed Breakdown

#### 1. Long Polling
*   **Mechanism**: Client requests data -> Server holds request open until data is available -> Server responds -> Client immediately requests again.
*   **Pros**:
    *   Works on essentially every device/server (universal compatibility).
    *   Easy to implement with basic AJAX.
*   **Cons**:
    *   **High Server Load**: Constant establishment and teardown of TCP connections.
    *   **Latency**: Slight delay between the response and the next new request.
    *   **Header Overhead**: HTTP headers sent with every poll request.
*   **Impact on this Project**:
    *   Would require more server resources (CPU/Memory) to handle the same number of concurrent users due to constant request processing.
    *   Scalability would be harder with standard HTTP load balancers due to the "hanging" nature of requests causing timeout issues or port exhaustion if not managed well.

#### 2. WebSockets
*   **Mechanism**: Client performs HTTP handshake to upgrade to a persistent, full-duplex TCP connection.
*   **Pros**:
    *   **True Bi-directional**: Client and Server can talk instantly at any time.
    *   **Lowest Latency/Overhead**: Tiny frame headers after handshake. Good for games/high-freq trading.
*   **Cons**:
    *   **Complex Scaling**: Requires "Sticky Sessions" or complex pub/sub to handle connections across servers.
    *   **Firewall Issues**: Corporate firewalls often block non-HTTP ports or persistent connections.
    *   **No Auto-Reconnection**: You must write logic to detect disconnects and retry.
*   **Impact on this Project**:
    *   Would add complexity to the load balancer setup (need sticky sessions).
    *   Overkill for a chat app where the client mostly just listens.
    *   We would need to handle "heartbeats" and reconnection logic manually.

#### 3. Server-Sent Events (SSE) (Current Choice)
*   **Mechanism**: Client opens a single long-lived HTTP connection. Server pushes text-based events.
*   **Pros**:
    *   **Simple HTTP**: Uses standard HTTP/1.1 or HTTP/2.
    *   **Auto-Reconnect**: Browser handles network blips automatically.
    *   **Lightweight**: Excellent for text streams (like Chat!).
*   **Cons**:
    *   **Unidirectional**: Server -> Client only. (We solved this by using HTTP POST for sending messages).
    *   **Connection Limit**: Browser limit of 6 connections per domain on HTTP/1.1 (Solved by HTTP/2).
*   **Impact on this Project**:
    *   **Perfect Fit**: Chat is 90% reading (receiving) and 10% writing (sending).
    *   **Dev Experience**: Easier to debug (it's just text in the Network tab).
    *   **Scalability**: Stateless HTTP requests fit perfectly with our Redis Pub/Sub model without needing complex sticky sessions.

---

## 🚀 Scalability & Redis

### The Challenge: Horizontal Scaling

In a basic Node.js app, active user connections are stored in memory (`RAM`).

- If you deploy 2 server instances (**Server A** and **Server B**)...
- User 1 connects to **Server A**.
- User 2 connects to **Server B**.
- **Issue**: User 1 _cannot_ Message User 2 because Server A has no idea User 2 exists on the other server.

### The Solution: Redis Pub/Sub

We utilize **Redis** as a message broker to solve this "Silo" problem.

1.  **Publisher**: When a message is sent to _any_ server, that server **Publishes** the message to a Redis channel (`sse_messages`).
2.  **Subscriber**: _Every_ server instance **Subscribes** to this channel.
3.  **Synchronization**: When Redis receives a message, it pushes it to **ALL** subscribed servers instantly.
4.  **Broadcast**: Each server receives the event and pushes it to its own connected local clients.

This architecture allows you to spin up 10, 50, or 100 backend instances to handle millions of users without code changes.

---

## 🛠️ Local Environment Setup

### Prerequisites

- **Node.js** (v20+)
- **MongoDB** (Database)
- **Redis** (Message Broker)

### 1. Start Infrastructure

Make sure your databases are running locally.

```bash
# Terminal 1
mongod

# Terminal 2
redis-server
```

### 2. Backend Setup (Server)

```bash
cd server

# Install Dependencies
npm install

# Create .env file
echo "PORT=5000" > .env
echo "MONGO_URI=mongodb://localhost:27017/sse-chat" >> .env
echo "JWT_SECRET=your_development_secret" >> .env
echo "REDIS_URL=redis://localhost:6379" >> .env

# Run Server
npm run dev
```

### 3. Frontend Setup (Client)

```bash
cd client

# Install Dependencies
npm install

# Run Client
npm run dev
```

### 4. Verification

Open `http://localhost:5173`.
You can open the app in multiple different browsers (Chrome, Firefox, Incognito) to differentiate "Sessions" and test the real-time interaction.
