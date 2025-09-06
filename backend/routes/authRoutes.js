const express = require("express");
const { signup, login, logout } = require("../controllers/authController");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");

const router = express.Router();

// Cloudinary storage config for profile uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profiles",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});
const upload = multer({ storage });

// Signup route with profile photo
router.post("/signup", upload.single("profilePhoto"), signup);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
