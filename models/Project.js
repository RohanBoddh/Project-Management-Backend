const mongoose = require("mongoose");

/* ===============================
   ✅ Submission Schema (NEW - REQUIRED)
================================ */
const submissionSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  filePath: String,
  fileName: String,
  uploadedAt: Date,
  status: {
    type: String,
    default: "Submitted",
  },
});

/* ===============================
   ✅ Task Schema (OLD - UNCHANGED)
================================ */
const taskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ["pending", "in progress", "completed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    dueDate: Date,
  },
  { timestamps: true }
);

/* ===============================
   ✅ Project Schema
   (OLD LOGIC PRESERVED)
================================ */
const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
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
    },

    // ✅ Assigned Members (UNCHANGED)
    assignedMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ✅ Manager (UNCHANGED)
    assignedManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },

    // ✅ Tasks (UNCHANGED)
    tasks: [taskSchema],

    // ✅ NEW (Required for MyTasks progress + uploads)
    submissions: [submissionSchema],

    tags: [
      {
        type: String,
      },
    ],

    budget: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

/* ===============================
   ✅ Performance Improvement (SAFE)
================================ */
projectSchema.index({ assignedMembers: 1 });

module.exports = mongoose.model("Project", projectSchema);