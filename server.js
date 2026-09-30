const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const {
  protect,
  authorizeRoles,
} = require("./middleware/authMiddleware");

const User = require("./models/User");
const Project = require("./models/Project");

// =====================================================
// ENV CONFIG
// =====================================================

dotenv.config();

// =====================================================
// EXPRESS APP
// =====================================================

const app = express();

// =====================================================
// CORS CONFIG
// =====================================================

const corsOptions = {
  origin: true,

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// =====================================================
// BODY PARSER
// =====================================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// =====================================================
// STATIC UPLOAD FOLDER
// =====================================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// =====================================================
// DATABASE MIDDLEWARE
// =====================================================

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error(
      "MongoDB Connection Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// =====================================================
// AUTH
// =====================================================

app.use(
  "/api/auth",
  require("./routes/authRoutes")
);

// =====================================================
// USERS
// =====================================================

app.use(
  "/api/users",
  require("./routes/userRoutes")
);

// =====================================================
// PROJECTS
// =====================================================

app.use(
  "/api/projects",
  require("./routes/projectRoutes")
);

// =====================================================
// TASKS
// =====================================================

app.use(
  "/api/tasks",
  require("./routes/taskRoutes")
);

// =====================================================
// TEAMS
// =====================================================

app.use(
  "/api/teams",
  require("./routes/teamRoutes")
);

// =====================================================
// MEMBER
// =====================================================

app.use(
  "/api/member",
  require("./routes/memberRoutes")
);

// =====================================================
// TESTIMONIALS
// =====================================================

app.use(
  "/api/testimonials",
  require("./routes/testimonials")
);

// =====================================================
// REPORTS
// =====================================================

app.use(
  "/api/reports",
  require("./routes/reportRoutes")
);

// =====================================================
// WORK
// =====================================================

app.use(
  "/api/work",
  require("./routes/workRoutes")
);

// =====================================================
// ANALYTICS
// =====================================================

app.get(
  "/api/analytics",
  protect,
  authorizeRoles("admin", "manager"),
  async (req, res) => {
    try {
      const totalUsers =
        await User.countDocuments();

      const totalProjects =
        await Project.countDocuments();

      const activeTasks = 0;

      return res.status(200).json({
        success: true,
        data: {
          totalUsers,
          totalProjects,
          activeTasks,
        },
      });
    } catch (error) {
      console.error(
        "Analytics Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  }
);

// =====================================================
// ROOT
// =====================================================

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Project Management API Running",
  });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Backend is healthy",
  });
});

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
  (err, req, res, next) => {
    console.error(
      "GLOBAL ERROR:",
      err
    );

    return res.status(
      err.statusCode || 500
    ).json({
      success: false,
      message:
        err.message ||
        "Internal Server Error",
    });
  }
);

// =====================================================
// LOCAL DEVELOPMENT ONLY
// =====================================================

if (require.main === module) {
  const PORT =
    process.env.PORT || 5000;

  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(
          `Server running on port ${PORT}`
        );
      });
    })
    .catch((error) => {
      console.error(
        "Failed to start server:",
        error
      );

      process.exit(1);
    });
}

// =====================================================
// EXPORT FOR VERCEL
// =====================================================

module.exports = app;