const mongoose = require("mongoose");

const workSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    stage: {
      type: String,
      enum: [
        "admin-to-manager",
        "manager-to-members",
        "manager-to-admin",
        "member-to-manager",
      ],
      required: true,
    },

    // ✅ Correct File Structure
    files: [
      {
        name: {
          type: String,
        },
        path: {
          type: String,
        },
        type: {
          type: String,
        },
      },
    ],

    status: {
      type: String,
      default: "sent",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Work", workSchema);