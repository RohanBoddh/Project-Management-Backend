const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      default: null,
    },

    phone: {
      // ✅ Added
      type: String,
      trim: true,
    },

    address: {
      // ✅ Added
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["admin", "manager", "member"],
      default: "member",
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    photo: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
