// server.js
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

// CORS setup: allow local dev and deployed frontend
const FRONTEND_URL = process.env.FRONTEND_URL || "https://chat-application-3-p3l8.onrender.com";
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Test Cloudinary
app.get("/api/test-cloudinary", async (req, res) => {
  try {
    const cloudinary = require("./config/cloudinary");
    const result = await cloudinary.api.ping();
    res.json({ cloudinary: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// HTTP server for Socket.IO
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Map to track online users
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  // Register user
  socket.on("registerUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  // Handle messages
  socket.on("sendMessage", (data) => {
    const receiverSocketId = onlineUsers.get(data.receiver);
    if (receiverSocketId) io.to(receiverSocketId).emit("receiveMessage", data);
    io.to(socket.id).emit("receiveMessage", data);
  });

  // Handle disconnect
  socket.on("disconnect", async () => {
    for (const [userId, sId] of onlineUsers.entries()) {
      if (sId === socket.id) {
        onlineUsers.delete(userId);
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

module.exports = { onlineUsers };
