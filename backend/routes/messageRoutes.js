const express = require("express");
const { sendMessage, getMessages } = require("../controllers/messageController");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");

const router = express.Router();

const messageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "chat-images",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
  },
});
const messageUpload = multer({ storage: messageStorage });

// Send message with optional image
router.post("/send", messageUpload.single("image"), sendMessage);

// Fetch messages between two users
router.get("/:userId/:otherUserId", getMessages);

module.exports = router;
