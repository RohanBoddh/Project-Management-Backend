const Project = require("../models/Project");
const User = require("../models/User");

// ======================================================
// CREATE PROJECT
// ======================================================
exports.createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      membersCount,
      assignedMembers,
      priority,
      tags,
      budget,
      assignedManager,
    } = req.body;

    const isAdmin = req.user.role?.toLowerCase() === "admin";
    const isManager = req.user.role?.toLowerCase() === "manager";

    let assignedMembersIds = [];

    if (assignedMembers && Array.isArray(assignedMembers)) {
      const users = await User.find({
        _id: { $in: assignedMembers },
      });

      if (isManager) {
        // 🔥 Manager can only assign role = member
        const validUsers = users.filter(
          (u) => u.role.toLowerCase() === "member"
        );
        assignedMembersIds = validUsers.map((u) => u._id);
      } else {
        assignedMembersIds = users.map((u) => u._id);
      }
    }

    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      membersCount: membersCount || 1,
      assignedMembers: assignedMembersIds,
      priority: priority || "Medium",
      tags: tags || [],
      budget: budget || 0,
      createdBy: req.user._id,

      // 🔥 Manager auto assigned
      assignedManager: isManager
        ? req.user._id
        : assignedManager || null,
    });

    res.status(201).json(project);
  } catch (err) {
    console.error("CREATE PROJECT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ======================================================
// GET PROJECTS
// ======================================================
exports.getProjects = async (req, res) => {
  try {
    let filter = {};
    const role = req.user.role?.toLowerCase();

    if (role === "manager") {
      filter = {
        $or: [
          { assignedManager: req.user._id },
          { assignedMembers: req.user._id },
        ],
      };
    }

    if (role === "member") {
      // 🔥 Member sees ONLY assigned projects
      filter = {
        assignedMembers: req.user._id,
      };
    }

    const projects = await Project.find(filter)
      .populate("createdBy", "name email department")
      .populate("assignedMembers", "name email department role")
      .populate("assignedManager", "name email department role")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error("GET PROJECTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ======================================================
// UPDATE PROJECT (SECURE)
// ======================================================
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isAdmin = req.user.role?.toLowerCase() === "admin";
    const isManager = req.user.role?.toLowerCase() === "manager";

    // 🔥 Manager can only edit his own project
    if (
      isManager &&
      project.assignedManager?.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You can only edit your own project" });
    }

    let assignedMembersIds = project.assignedMembers;

    if (req.body.assignedMembers && Array.isArray(req.body.assignedMembers)) {
      const users = await User.find({
        _id: { $in: req.body.assignedMembers },
      });

      if (isManager) {
        const validUsers = users.filter(
          (u) => u.role.toLowerCase() === "member"
        );
        assignedMembersIds = validUsers.map((u) => u._id);
      } else {
        assignedMembersIds = users.map((u) => u._id);
      }
    }

    // Update allowed fields
    project.name = req.body.name || project.name;
    project.description = req.body.description || project.description;
    project.startDate = req.body.startDate || project.startDate;
    project.endDate = req.body.endDate || project.endDate;
    project.membersCount =
      req.body.membersCount || project.membersCount;
    project.priority = req.body.priority || project.priority;
    project.tags = req.body.tags || project.tags;
    project.budget = req.body.budget || project.budget;
    project.assignedMembers = assignedMembersIds;

    // 🔥 Only admin can change manager
    if (isAdmin && req.body.assignedManager) {
      project.assignedManager = req.body.assignedManager;
    }

    const updatedProject = await project.save();

    const populatedProject = await Project.findById(updatedProject._id)
      .populate("createdBy", "name email department")
      .populate("assignedMembers", "name email department role")
      .populate("assignedManager", "name email department role");

    res.json(populatedProject);
  } catch (err) {
    console.error("UPDATE PROJECT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ======================================================
// DELETE PROJECT (SECURE)
// ======================================================
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isAdmin = req.user.role?.toLowerCase() === "admin";
    const isManager = req.user.role?.toLowerCase() === "manager";

    if (
      isManager &&
      project.assignedManager?.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You can only delete your own project" });
    }

    await project.deleteOne();

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("DELETE PROJECT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};