const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const {
  getAssignedProjects,
  uploadWork, // ✅ IMPORT ADD
} = require("../controllers/memberController");

const { getMyTasks } = require("../controllers/taskController");

/* ===============================
   Assigned Projects
================================ */
router.get(
  "/assigned-projects",
  protect,
  authorizeRoles("member", "admin"),
  getAssignedProjects
);

/* ===============================
   ✅ UPLOAD WORK ROUTE (FIX 404)
================================ */
router.post(
  "/upload-work",
  protect,
  authorizeRoles("member", "admin"),
  uploadWork
);

/* ===============================
   My Tasks
================================ */
router.get(
  "/my-tasks",
  protect,
  authorizeRoles("member", "admin"),
  getMyTasks
);

module.exports = router;