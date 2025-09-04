const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register user, storing profile photo on Cloudinary if provided
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Prevent duplicate registration
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Account already exists for this email." });
    }

    // Secure password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Use Cloudinary URL for profile photo if uploaded
    let profilePhoto = "";
    if (req.file && req.file.path) {
      profilePhoto = req.file.path;
    }

    // Create and store new user
    const user = new User({
      username,
      email,
      password: encryptedPassword,
      profilePhoto,
    });

    await user.save();

    // Generate authentication token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({
      message: "Registration successful.",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Unable to register user.", error: err.message });
  }
};

// Authenticate user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Incorrect email or password." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Incorrect email or password." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      message: "Login successful.",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Unable to login.", error: err.message });
  }
};

// Logout user
exports.logout = async (req, res) => {
  res.json({ message: "Logout successful." });
};
