const Project = require("../models/Project");
const multer = require("multer");
const path = require("path");

// Multer Config for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Get Assigned Projects
exports.getAssignedProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      assignedMembers: req.user._id,
    })
      .populate("assignedMembers", "name email department role")
      .populate("assignedManager", "name department role");

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Upload Work (Middleware included)
exports.uploadWork = [
  upload.array("files"), // must match FormData key
  async (req, res) => {
    try {
      const { projectId } = req.body;
      const userId = req.user._id;

      // ✅ FIXED (because using upload.array)
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Please upload a file" });
      }

      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Add submission (keeping your original structure)
      project.submissions.push({
        memberId: userId,
        filePath: req.files[0].path,
        fileName: req.files[0].originalname,
        uploadedAt: Date.now(),
        status: "Submitted",
      });

      await project.save();

      res.json({
        message: "Work uploaded successfully",
        fileName: req.files[0].originalname,
        date: Date.now(),
      });
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  },
];