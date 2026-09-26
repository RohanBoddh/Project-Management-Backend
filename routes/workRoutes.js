const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/workUpload");

const {
  createWork,
  getProjectWork,
  getMySentWork,
  getMyReceivedWork,
} = require("../controllers/workController");

router.post("/", protect, upload.array("files"), createWork);

router.get("/project/:projectId", protect, getProjectWork);
router.get("/sent", protect, getMySentWork);
router.get("/received", protect, getMyReceivedWork);

module.exports = router;