const mongoose = require("mongoose");

const projectRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    membersCount: {
      type: Number,
      default: 1,
      min: 1,
    },

    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    budget: {
      type: Number,
      default: 0,
      min: 0,
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedMembers: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProjectRequest", projectRequestSchema);