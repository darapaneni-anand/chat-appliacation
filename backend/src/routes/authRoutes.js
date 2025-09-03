const express = require("express");
const { signup, login, logout } = require("../controllers/authController");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Multer config for profile uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads/profiles")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Signup route with profile photo
router.post("/signup", upload.single("profilePhoto"), signup);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
