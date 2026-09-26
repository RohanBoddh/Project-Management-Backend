const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  generateReport,
  getAllReports,
  getReportById,
  deleteReport,
} = require("../controllers/reportController");

router.post("/", protect, generateReport);
router.get("/", protect, getAllReports);
router.get("/:id", protect, getReportById);
router.delete("/:id", protect, deleteReport);

module.exports = router;