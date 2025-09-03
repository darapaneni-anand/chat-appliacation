const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Message = require("../models/Message");

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Text message
router.post("/", async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;
    if (!sender || !receiver)
      return res.status(400).json({ error: "Sender and receiver are required" });

    const message = new Message({ sender, receiver, text });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    console.error("Text message error:", err);
    res.status(500).json({ error: "Server error while sending text message" });
  }
});

// Get messages between two users
router.get("/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ error: "Server error while fetching messages" });
  }
});

// Image message
router.post("/image", upload.single("image"), async (req, res) => {
  try {
    const { sender, receiver, text = "" } = req.body;

    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const newMsg = new Message({ sender, receiver, text, imageUrl });
    await newMsg.save();

    res.status(201).json(newMsg);
  } catch (err) {
    console.error("Image message error:", err);
    res.status(500).json({ error: "Server error while sending image message" });
  }
});

module.exports = router;
