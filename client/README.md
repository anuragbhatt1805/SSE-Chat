# Client - SSE Chat Application

## Architecture

The frontend is built using **React** with **Vite** for fast development.

- **Routing**: `react-router-dom` handles navigation between Auth, Lobby, and Chat rooms.
- **State Management**:
  - `AuthContext`: Manages user authentication state and JWT storage.
  - Local State: Components manage their own UI state (messages, input, etc.).
- **Real-time Communication**:
  - **Server-Sent Events (SSE)**: Uses the native `EventSource` API to receive real-time updates (messages, participant joins, room closure) from the backend.
  - **Reconnection**: Handled natively by the browser's `EventSource` implementation. We explicitly permit retries on error.

## Setup & Run

1.  **Install Dependencies**:

    ```bash
    npm install
    ```

2.  **Environment Setup**:
    - The client currently connects to `http://localhost:5000` by default.
    - No `.env` file is strictly required for local development.

3.  **Run Locally**:
    ```bash
    npm run dev
    ```

    - Access the app at `http://localhost:5173`.

## Key Components

- `pages/Auth.jsx`: Login/Signup forms with glassmorphism UI.
- `pages/Lobby.jsx`: Interface to create or join rooms.
- `pages/ChatRoom.jsx`: Main chat interface. Handles SSE connection, message rendering, and room management.
