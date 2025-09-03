const express = require("express");
const { signup, login, logout } = require("../controllers/authController");
const User = require("../models/User");
const onlineUsers = require("../index").onlineUsers; // Export onlineUsers from index.js

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Get all users (except current)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "_id username email");
    res.json(users); // No isOnline property
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

module.exports = router;
