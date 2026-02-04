const { createClient } = require("redis");

let clients = {}; // { roomId: [res1, res2, ...] }
let publisher;
let subscriber;

// Initialize Redis
(async () => {
  try {
    publisher = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });
    subscriber = publisher.duplicate();

    await publisher.connect();
    await subscriber.connect();

    console.log("Redis Connected (Pub/Sub)");

    // Subscribe to a global channel for SSE messages
    await subscriber.subscribe("sse_messages", (message) => {
      const { roomId, data } = JSON.parse(message);
      broadcastToLocalClients(roomId, data);
    });
  } catch (err) {
    console.error("Redis Connection Error:", err);
  }
})();

const broadcastToLocalClients = (roomId, data) => {
  if (!clients[roomId]) return;
  clients[roomId].forEach((client) => {
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
};

const eventsHandler = (req, res) => {
  const { roomId } = req.params;

  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };
  res.writeHead(200, headers);

  if (!clients[roomId]) {
    clients[roomId] = [];
  }

  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res,
  };

  clients[roomId].push(newClient);

  req.on("close", () => {
    // console.log(`${clientId} Connection closed`);
    if (clients[roomId]) {
      clients[roomId] = clients[roomId].filter(
        (client) => client.id !== clientId,
      );
    }
  });

  // Send initial connection success message
  res.write(
    `data: ${JSON.stringify({ type: "connected", msg: "Connected to SSE" })}\n\n`,
  );
};

const notifyRoom = (roomId, data) => {
  // Instead of direct broadcast, publish to Redis
  if (publisher && publisher.isOpen) {
    publisher.publish("sse_messages", JSON.stringify({ roomId, data }));
  } else {
    // Fallback if Redis fails/not connected (or for local dev without redis)
    broadcastToLocalClients(roomId, data);
  }
};

module.exports = {
  eventsHandler,
  notifyRoom,
};
