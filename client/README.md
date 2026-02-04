# Client Documentation

A **React** application initialized with **Vite**, designed for stability and real-time responsiveness.

## Architecture

### State Strategy
The application prioritizes **Optimistic UI** and **Offline Resilience**.
-   **Authentication**: Managed via Context API (`AuthContext`). User session persists in LocalStorage (token).
-   **Chat State**: Messages and Participants are held in local component state. This ensures that if the server connection drops, the user can still read existing messages.

### Server-Sent Events (SSE) Integration
We connect to the server using the native browser `EventSource` API.
```javascript
const source = new EventSource('/api/chat/events/' + roomId);

source.onmessage = (event) => {
    // Handle new message
};
```

**Why Native EventSource?**
-   It handles **Automatic Reconnection**. If the server restarts or the internet drops, the browser automatically polls to reconnect (usually every 3 seconds).
-   We explicitly handle the `onerror` state to show Visual Toast Notifications to the user ("Connection Lost").

## Setup

1.  **Install**: `npm install`
2.  **Develop**: `npm run dev` (Starts Vite on port 5173).

## Key Features
-   **Dark Mode UI**: Glassmorphism aesthetic.
-   **Room Management**: Authenticated users can create rooms; Guests can join via link.
-   **Live Updates**: Participant lists & messages sync in real-time.
