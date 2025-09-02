const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const userRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", userRoutes);

app.use("/api/messages", messageRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Socket.IO real-time chat
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("sendMessage", (data) => {
    console.log(" Message received:", data);
    io.emit("receiveMessage", data); // broadcast to all
  });

  socket.on("disconnect", () => {
    console.log(" User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(` Server running on port ${PORT}`));
