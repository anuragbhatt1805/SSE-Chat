# Real-time Chat Application (SSE + Redis)

A robust, scalable chat application built with the MERN stack (MongoDB, Express, React, Node.js), demonstrating the power of **Server-Sent Events (SSE)** for real-time communication.

## 🧐 Why Server-Sent Events (SSE)?

Most chat applications use **WebSockets** for bidirectional communication. However, for many use cases, **SSE** is a superior architectural choice.

### SSE vs WebSockets Comparison

| Feature           | Server-Sent Events (SSE)              | WebSockets                      | Why we chose SSE                                                                                                           |
| :---------------- | :------------------------------------ | :------------------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| **Communication** | **Unidirectional** (Server -> Client) | **Bidirectional** (Full Duplex) | Chat apps primarily _receive_ streams of messages. Sending is easily handled by standard HTTP POST requests.               |
| **Protocol**      | **Standard HTTP**                     | Upgrade to TCP                  | SSE works seamlessly with standard Load Balancers, Firewalls, and Authentication logic without complex handshake upgrades. |
| **Reconnection**  | **Automatic** (Built-in)              | Manual Implementation           | The browser's native `EventSource` API handles connection drops and retries automatically.                                 |
| **Scalability**   | High (Stateless-ish)                  | Harder (Sticky Sessions)        | Scaling HTTP traffic is a solved problem.                                                                                  |

**The Cons of SSE**:

- Binary data is harder to send (must be base64 encoded).
- Maximum connection limits on HTTP/1.1 (6 per domain). _Mitigated by using HTTP/2._

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
