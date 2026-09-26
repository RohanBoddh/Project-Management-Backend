const mongoose = require("mongoose");
const Work = require("../models/Work");
const Project = require("../models/Project");

/* ===================================================== */
/* CREATE WORK - ROLE BASED */
/* ===================================================== */

const createWork = async (req, res) => {
  try {
    const { project, title, description, sendTo } = req.body;

    // ✅ Basic validation
    if (!project || !mongoose.Types.ObjectId.isValid(project)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const projectData = await Project.findById(project)
      .populate("assignedManager")
      .populate("assignedMembers")
      .populate("createdBy");

    if (!projectData) {
      return res.status(404).json({ message: "Project not found" });
    }

    let receivers = [];
    let stage = "";

    /* ================= ADMIN ================= */
    if (req.user.role === "admin") {
      if (!projectData.assignedManager)
        return res.status(400).json({ message: "No manager assigned" });

      receivers = [projectData.assignedManager._id];
      stage = "admin-to-manager";
    }

    /* ================= MANAGER ================= */
    else if (req.user.role === "manager") {
      if (sendTo === "members") {
        if (!projectData.assignedMembers.length)
          return res.status(400).json({ message: "No members assigned" });

        receivers = projectData.assignedMembers.map((m) => m._id);
        stage = "manager-to-members";
      }

      else if (sendTo === "admin") {
        if (!projectData.createdBy)
          return res.status(400).json({ message: "No admin found" });

        receivers = [projectData.createdBy._id];
        stage = "manager-to-admin";
      }

      else {
        return res.status(400).json({ message: "Invalid send target" });
      }
    }

    /* ================= MEMBER ================= */
    else if (req.user.role === "member") {
      if (!projectData.assignedManager)
        return res.status(400).json({ message: "No manager assigned" });

      receivers = [projectData.assignedManager._id];
      stage = "member-to-manager";
    }

    else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    /* ================= FILES ================= */
    const files =
      req.files?.map((file) => ({
        name: file.originalname,
        path: file.path,
        type: file.mimetype,
      })) || [];

    if (receivers.length === 0) {
      return res.status(400).json({ message: "No receivers found" });
    }

    const createdWorks = await Promise.all(
      receivers.map((receiver) =>
        Work.create({
          project,
          title,
          description,
          sender: req.user._id,
          receiver,
          stage,
          files,
          status: "sent",
        })
      )
    );

    res.status(201).json(createdWorks);

  } catch (err) {
    console.error("Create Work Error:", err);
    res.status(500).json({
      message: "Work creation failed",
      error: err.message,
    });
  }
};

/* ===================================================== */
/* PROJECT WORK HISTORY */
/* ===================================================== */

const getProjectWork = async (req, res) => {
  try {
    const works = await Work.find({
      project: req.params.projectId,
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id },
      ],
    })
      .populate("sender", "name email department role")
      .populate("receiver", "name email department role")
      .sort({ createdAt: -1 });

    res.json(works);
  } catch (error) {
    console.error("Project Work Fetch Error:", error);
    res.status(500).json({ message: "Error fetching project work" });
  }
};

/* ===================================================== */
/* SENT WORK */
/* ===================================================== */

const getMySentWork = async (req, res) => {
  try {
    const works = await Work.find({
      sender: req.user._id,
    })
      .populate("project", "name")
      .populate("receiver", "name email department role")
      .sort({ createdAt: -1 });

    res.json(works);
  } catch (error) {
    console.error("Sent Work Fetch Error:", error);
    res.status(500).json({ message: "Error fetching sent work" });
  }
};

/* ===================================================== */
/* RECEIVED WORK */
/* ===================================================== */

const getMyReceivedWork = async (req, res) => {
  try {
    const works = await Work.find({
      receiver: req.user._id,
    })
      .populate("project", "name")
      .populate("sender", "name email department role")
      .sort({ createdAt: -1 });

    res.json(works);
  } catch (error) {
    console.error("Received Work Fetch Error:", error);
    res.status(500).json({ message: "Error fetching received work" });
  }
};

module.exports = {
  createWork,
  getProjectWork,
  getMySentWork,
  getMyReceivedWork,
};