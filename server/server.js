const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/sse-chat")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Routes Placeholder
app.use("/api/auth", require("./routes/auth"));
app.use("/api/chat", require("./routes/chat"));

app.get("/", (req, res) => {
  res.send("SSE Chat Server Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
