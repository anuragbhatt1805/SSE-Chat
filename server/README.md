# Server - SSE Chat Application

## Architecture

The backend is a Node.js application using **Express**.

- **Database**: **MongoDB** (via Mongoose) stores Users, Rooms, and Messages.
- **Authentication**: JWT-based auth. Passwords hashed with `bcryptjs`.
- **Real-time Engine**: **Server-Sent Events (SSE)**.
  - Instead of WebSockets, we use a unidirectional HTTP stream (`text/event-stream`).
  - Clients connect to `/api/chat/events/:roomId`.
  - The server maintains a list of open response objects (`res`) for each room and writes data to them when new events occur.

## Setup & Run

1.  **Install Dependencies**:

    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Create a `.env` file in this directory:

    ```
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/sse-chat
    JWT_SECRET=your_super_secret_key
    ```

    _(A sample `.env` has been provided)._

3.  **Run Locally**:
    ```bash
    npm run dev
    ```

    - The server runs on port `5000`.

## API Endpoints

- **Auth**: `POST /signup`, `POST /login`
- **Chat**:
  - `POST /rooms` (Create)
  - `POST /rooms/join` (Join)
  - `POST /rooms/:id/messages` (Send Message)
  - `DELETE /rooms/:id` (Close Room)
  - `GET /rooms/:id` (Get Details)
- **SSE**: `GET /events/:id` (Stream)
