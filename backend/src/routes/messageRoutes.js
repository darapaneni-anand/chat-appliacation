const express = require("express");
const router = express.Router();
const Message = require("../models/Message");


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

module.exports = router;
