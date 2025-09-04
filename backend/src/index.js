const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require("./routes/userRoutes");




dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);


app.get("/api/test-cloudinary", async (req, res) => {
  try {
    const cloudinary = require("./config/cloudinary");
    const result = await cloudinary.api.ping();
    res.json({ cloudinary: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create HTTP server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Map to track online users: userId => socketId
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  // Register user
  socket.on("registerUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  // Send message
  socket.on("sendMessage", (data) => {
    console.log("📩 Message received:", data);

    // Send to receiver if online
    const receiverSocketId = onlineUsers.get(data.receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", data);
    }

    // Also send to sender
    io.to(socket.id).emit("receiveMessage", data);
  });

  // server.js (inside socket.on("disconnect"))
socket.on("disconnect", async () => {
  for (const [userId, sId] of onlineUsers.entries()) {
    if (sId === socket.id) {
      onlineUsers.delete(userId);

      // ✅ Update lastSeen in DB
      try {
        const User = require("./models/User");
        await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
      } catch (err) {
        console.error("Error updating lastSeen:", err);
      }
    }
  }

  io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  console.log("❌ User disconnected:", socket.id);
});


});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Export onlineUsers if needed elsewhere
module.exports = { onlineUsers };
