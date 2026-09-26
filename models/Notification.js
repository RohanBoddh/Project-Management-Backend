// models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["project_assigned", "task_assigned", "task_completed", "message", "deadline", "general"],
    default: "general",
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  actionUrl: {
    type: String,
    default: null,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    default: null,
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    default: null,
  },
}, {
  timestamps: true,
});

// Index for faster queries
notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);