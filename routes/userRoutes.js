const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const multer = require("multer");
const path = require("path");


// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      "photo-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });


// =======================================================
// 🔥 IMPORTANT: /me route MUST be above "/:id"
// =======================================================

// ================= GET CURRENT LOGGED IN USER =================
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (err) {
    console.error("GET ME ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
});


// ================= GET ALL USERS =================
router.get(
  "/",
  protect,
  authorizeRoles("admin", "manager"),
  async (req, res) => {
    try {
      const users = await User.find().select("-password");
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);


// ================= CREATE USER =================
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { name, email, phone, address, role, department } = req.body;

      if (!name || !email || !department) {
        return res.status(400).json({ message: "Required fields missing" });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = new User({
        name,
        email,
        phone,
        address,
        role,
        department,
      });

      const savedUser = await user.save();

      res.status(201).json(savedUser);

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);


// ================= UPDATE PROFILE (NAME + PHOTO) =================
router.put(
  "/updateProfile",
  protect,
  upload.single("photo"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update name if provided
      if (req.body.name) {
        user.name = req.body.name;
      }

      // Update photo if uploaded
      if (req.file) {
        user.photo = req.file.filename;
      }

      const updatedUser = await user.save();

      res.json(updatedUser);

    } catch (err) {
      console.error("UPDATE PROFILE ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);


// ================= GET SINGLE USER =================
router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);


// ================= UPDATE USER =================
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { name, email, phone, address, role, department } = req.body;

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.name = name || user.name;
      user.email = email || user.email;
      user.phone = phone || user.phone;
      user.address = address || user.address;
      user.role = role || user.role;
      user.department = department || user.department;

      const updatedUser = await user.save();

      res.json(updatedUser);

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);


// ================= DELETE USER =================
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await user.deleteOne();

      res.json({ message: "User deleted successfully" });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

module.exports = router;