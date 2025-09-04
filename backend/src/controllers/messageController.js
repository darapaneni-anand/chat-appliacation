const Message = require("../models/Message");

// Send message (with optional image from Cloudinary)
exports.sendMessage = async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;

    // Validate required fields
    if (!sender || !receiver) {
      return res
        .status(400)
        .json({ message: "sender and receiver are required." });
    }

    let imageUrl = "";
    if (req.file && req.file.path) {
      imageUrl = req.file.path; // Cloudinary URL
    }

    const message = new Message({
      sender,
      receiver,
      text,
      imageUrl, // Save to imageUrl field
    });

    await message.save();

    res.status(201).json({ message: "Message sent.", data: message });
  } catch (err) {
    console.error("Send message error:", err);
    res
      .status(500)
      .json({ message: "Unable to send message.", error: err.message });
  }
};

// Get messages for a chat
exports.getMessages = async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: "Unable to fetch messages.", error: err.message });
  }
};
