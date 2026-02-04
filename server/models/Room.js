const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [{
    name: String, // Store just the name for simplicity, or handle auth vs guest logic
    socketId: String // Optional: if tracking connection IDs
  }],
  messages: [{
    sender: String,
    text: String,
    timestamp: {
      type: Date,
      default: Date.now,
    }
  }]
});

module.exports = mongoose.model('Room', RoomSchema);
