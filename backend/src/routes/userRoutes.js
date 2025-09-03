const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Get all users except current
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "_id username email profilePhoto"); // return only needed fields
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

module.exports = router;
