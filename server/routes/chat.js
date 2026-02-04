const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const auth = require("../middleware/auth"); // Optional for some routes
const { eventsHandler, notifyRoom } = require("../controllers/sse");
const { v4: uuidv4 } = require("uuid");

// Middleware helper: Check if user is authenticated (optional)
// We'll handle auth manually inside routes for mixed access

// GET /api/chat/events/:roomId
router.get("/events/:roomId", eventsHandler);

// GET /api/chat/rooms/:roomId - Get Room Details
router.get("/rooms/:roomId", async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ msg: "Room not found" });
    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// POST /api/chat/rooms - Create Room (Auth only)
router.post("/rooms", auth, async (req, res) => {
  try {
    const newRoom = new Room({
      roomId: uuidv4(),
      creator: req.user.id,
      participants: [], // Creator will join separately or auto-join
    });

    // Auto-join creator? Let's assume creator joins via client logic or here.
    // Let's keep participants array for active users or history?
    // Requirement: "join creator as first user"
    // We need creator's name. User model has username.
    // We'll fetch user to get name.

    const User = require("../models/User");
    const user = await User.findById(req.user.id);

    newRoom.participants.push({ name: user.username });

    await newRoom.save();
    res.json(newRoom);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// POST /api/chat/rooms/join - Join Room
router.post("/rooms/join", async (req, res) => {
  const { roomId, name } = req.body;

  if (!roomId || !name) {
    return res.status(400).json({ msg: "Room ID and Name required" });
  }

  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ msg: "Room not found" });
    }

    // Check if already in participants?
    // For simplicity, just add if not present
    // Or just return success.
    // For now, we update the DB to track participants.

    const exists = room.participants.find((p) => p.name === name);
    if (!exists) {
      room.participants.push({ name });
      await room.save();
      notifyRoom(roomId, {
        type: "join",
        user: name,
        participantsCount: room.participants.length,
      });
    }

    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// POST /api/chat/rooms/:roomId/messages - Send Message
router.post("/rooms/:roomId/messages", async (req, res) => {
  const { roomId } = req.params;
  const { sender, text } = req.body;

  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ msg: "Room not found" });
    }

    const newMessage = { sender, text, timestamp: new Date() };
    room.messages.push(newMessage);
    await room.save();

    notifyRoom(roomId, { type: "message", message: newMessage });
    res.json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// DELETE /api/chat/rooms/:roomId - Close Room (Auth only, Creator only)
router.delete("/rooms/:roomId", auth, async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ msg: "Room not found" });
    }

    // Check if creator
    if (room.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    await Room.deleteOne({ roomId });

    // Notify all clients
    notifyRoom(roomId, {
      type: "room_closed",
      msg: "The creator has closed the room.",
    });

    res.json({ msg: "Room removed" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
