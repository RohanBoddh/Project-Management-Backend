```js
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
    origin: true,
    credentials: true,
  })
);

// ================= DATABASE =================
// Connect to MongoDB before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB Connection Error:", error);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

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

// Work Flow System
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
  }
);

// ================= ROOT ROUTE =================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Project Management API Running",
  });
});

// ================= HEALTH CHECK =================

app.get("/health", async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is healthy",
  });
});

// ================= GLOBAL ERROR HANDLER =================

app.use((err, req, res, next) => {
  console.error("Global Error:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ================= SERVER =================

// IMPORTANT:
// Do NOT use app.listen() when running as a Vercel serverless function.
//
// Local development is handled only when running directly with:
// node server.js
//
// Vercel will use the exported Express app.

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${ PORT } `);
      });
    })
    .catch((error) => {
      console.error("Failed to start server:", error);
      process.exit(1);
    });
}

// Export Express app for Vercel
module.exports = app;
```
