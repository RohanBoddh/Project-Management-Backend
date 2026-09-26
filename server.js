// ================= IMPORTS =================
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const { protect, authorizeRoles } = require("./middleware/authMiddleware");

const User = require("./models/User");
const Project = require("./models/Project");

// ================= CONFIG =================
dotenv.config();
connectDB();

const app = express();

// ================= MIDDLEWARE =================

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Upload Folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or any localhost/vercel domain
      callback(null, true);
    },
    credentials: true,
  }),
);

// ================= ROUTES =================

// Auth & Users
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Core Modules
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/teams", require("./routes/teamRoutes"));
app.use("/api/member", require("./routes/memberRoutes"));

// Extra Features
app.use("/api/testimonials", require("./routes/testimonials"));
app.use("/api/reports", require("./routes/reportRoutes"));

// ✅ WORK FLOW SYSTEM (Admin → Manager → Member)
app.use("/api/work", require("./routes/workRoutes"));

// ================= ANALYTICS API =================

app.get(
  "/api/analytics",
  protect,
  authorizeRoles("admin", "manager"),
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalProjects = await Project.countDocuments();

      // Future-ready placeholder
      const activeTasks = 0;

      res.status(200).json({
        success: true,
        data: {
          totalUsers,
          totalProjects,
          activeTasks,
        },
      });
    } catch (error) {
      console.error("Analytics Error:", error);
      res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  },
);

// ================= ROOT ROUTE =================
app.get("/", (req, res) => {
  res.status(200).json({
    message: "🚀 Project Management API Running",
  });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
