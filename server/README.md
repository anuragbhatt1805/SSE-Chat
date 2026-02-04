# Server API Documentation

The backend service built with **Express**, **MongoDB**, and **Redis**.

## Core Responsibilities

1.  **REST API**: Handles user authentication, room management, and message receipt.
2.  **SSE Engine**: Maintains heavy, long-lived HTTP connections to push updates to clients.
3.  **Synchronization**: orchestrates multi-server events via Redis.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Message Broker**: Redis (Pub/Sub)
- **Auth**: JSON Web Tokens (JWT)

## Setup & Configuration

### Environment Variables (.env)

| Variable     | Description               | Default                              |
| :----------- | :------------------------ | :----------------------------------- |
| `PORT`       | Server listening port     | `5000`                               |
| `MONGO_URI`  | MongoDB connection string | `mongodb://localhost:27017/sse-chat` |
| `REDIS_URL`  | Redis connection string   | `redis://localhost:6379`             |
| `JWT_SECRET` | Secret for signing tokens | `secret`                             |

### Installation

```bash
npm install
npm run dev
```

## API Endpoints

### Auth

- `POST /api/auth/signup`: Create account.
- `POST /api/auth/login`: Authenticate and receive Token.

### Chat

- `POST /api/chat/rooms`: Create a new room.
- `POST /api/chat/rooms/join`: Join an existing room.
- `GET /api/chat/rooms/:roomId`: Fetch participants and history.
- `DELETE /api/chat/rooms/:roomId`: Delete/Close a room.

### Real-Time

- `GET /api/chat/events/:roomId`: The SSE stream endpoint.
