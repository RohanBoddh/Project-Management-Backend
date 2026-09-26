// routes/teamRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { createTeam, getTeams, updateTeam, deleteTeam } = require("../controllers/teamController");

// Create team (Admin + Manager)
router.post("/", protect, authorizeRoles("admin", "manager"), createTeam);

// Get teams
router.get("/", protect, getTeams);

// Update team (Admin + Manager)
router.put("/:id", protect, authorizeRoles("admin", "manager"), updateTeam);

// Delete team (Admin + Manager)
router.delete("/:id", protect, authorizeRoles("admin", "manager"), deleteTeam);

module.exports = router;