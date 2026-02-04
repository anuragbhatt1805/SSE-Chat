let clients = {}; // { roomId: [res1, res2, ...] }

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
    console.log(`${clientId} Connection closed`);
    clients[roomId] = clients[roomId].filter(
      (client) => client.id !== clientId,
    );
  });

  // Send initial connection success message
  res.write(
    `data: ${JSON.stringify({ type: "connected", msg: "Connected to SSE" })}\n\n`,
  );
};

const notifyRoom = (roomId, data) => {
  if (!clients[roomId]) return;

  clients[roomId].forEach((client) => {
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
};

module.exports = {
  eventsHandler,
  notifyRoom,
};
