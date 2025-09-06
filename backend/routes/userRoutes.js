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
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // exclude password
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
