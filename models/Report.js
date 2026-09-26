const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);