const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const Project = require("../models/Project");
const ProjectRequest = require("../models/ProjectRequest");

// ================= PROJECT REQUEST ROUTES =================

// Manager submit request
router.post("/request", protect, async (req, res) => {
  try {
    const request = new ProjectRequest({
      ...req.body,
      requestedBy: req.user._id,
    });

    await request.save();
    res.status(201).json({ message: "Request submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= ADMIN GET REQUESTS =================
router.get("/requests", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const requests = await ProjectRequest.find()
      .populate("requestedBy", "name email role department")
      .populate("assignedMembers", "name email role department");

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= MANAGER GET OWN REQUESTS =================
router.get(
  "/my-requests",
  protect,
  authorizeRoles("manager"),
  async (req, res) => {
    try {
      const requests = await ProjectRequest.find({
        requestedBy: req.user._id,
      }).populate("requestedBy", "name email role department");

      res.json(requests);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ================= APPROVE / REJECT REQUEST =================
router.put(
  "/request/:id",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { status } = req.body;

      const request = await ProjectRequest.findById(req.params.id).populate(
        "requestedBy"
      );

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      request.status = status;
      await request.save();

      // ✅ CREATE REAL PROJECT WHEN APPROVED
      if (status === "approved") {
        await Project.create({
          name: request.name,
          description: request.description,
          startDate: request.startDate,
          endDate: request.endDate,
          membersCount: request.membersCount,
          priority: request.priority,
          tags: request.tags,
          budget: request.budget,
          createdBy: request.requestedBy._id,
          assignedManager: request.requestedBy._id,
          assignedMembers: request.assignedMembers || [],
        });
      }

      res.json({ message: `Request ${status}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ================= NEW DELETE REQUEST ROUTE =================
// ✅ ONLY THIS IS ADDED (Old logic untouched)

router.delete(
  "/request/:id",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const request = await ProjectRequest.findById(req.params.id);

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      await request.deleteOne();

      res.json({ message: "Request deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ================= PROJECT CRUD ROUTES =================

// Create project (Admin + Manager)
router.post("/", protect, authorizeRoles("admin", "manager"), createProject);

// Get projects
router.get("/", protect, getProjects);

// Update project
router.put("/:id", protect, authorizeRoles("admin", "manager"), updateProject);

// Delete project
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "manager"),
  deleteProject
);

module.exports = router;