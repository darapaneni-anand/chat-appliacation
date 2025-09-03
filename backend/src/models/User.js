const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePhoto: { type: String, default: "/images/profile.png" } ,
  lastSeen: {
  type: Date,
  default: Date.now,
}
// default photo
});

module.exports = mongoose.model("User", UserSchema);
