const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const {
  createTask,
  getMyTasks,
} = require("../controllers/taskController");

// admin + manager
router.post("/", protect, authorizeRoles("admin","manager"), createTask);

// member
router.get("/my", protect, getMyTasks);

module.exports = router;
