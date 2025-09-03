const express = require("express");
const multer = require("multer");
const Message = require("../models/Message");
const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.post("/", async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;
    const message = new Message({ sender, receiver, text });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
});

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
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
});

// Image message route
router.post("/image", upload.single("image"), async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const newMsg = new Message({
      sender,
      receiver,
      text,
      imageUrl,
      createdAt: new Date(),
    });
    await newMsg.save();
    res.json({
      _id: newMsg._id,
      sender,
      receiver,
      text,
      imageUrl,
      createdAt: newMsg.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to send image message" });
  }
});

module.exports = router;
