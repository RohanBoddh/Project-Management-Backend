const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const {
  register,
  login,
  getMe,
} = require("../controllers/authController");

const User = require("../models/User");

// ================= VERIFY TOKEN =================
const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  try {
    const jwt = require("jsonwebtoken");

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    console.error("TOKEN ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// ================= MULTER CONFIG =================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const unique =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9);

    cb(
      null,
      file.fieldname +
        "-" +
        unique +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
});

// ================= REGISTER =================
// POST /api/auth/register

router.post("/register", register);

// ================= LOGIN =================
// POST /api/auth/login

router.post("/login", login);

// ================= GET ME =================
// GET /api/auth/me

router.get("/me", verifyToken, getMe);

// ================= UPDATE PROFILE =================
// PUT /api/auth/updateProfile

router.put(
  "/updateProfile",
  verifyToken,
  upload.single("photo"),
  async (req, res) => {
    try {
      const userId = req.user.id;

      const updateData = {};

      if (req.body.name) {
        updateData.name = req.body.name;
      }

      if (req.file) {
        updateData.photo = req.file.path;
      }

      const updatedUser =
        await User.findByIdAndUpdate(
          userId,
          updateData,
          {
            new: true,
          }
        ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// ================= FORGOT PASSWORD =================
// POST /api/auth/forgot-password

router.post(
  "/forgot-password",
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const resetToken =
        crypto.randomBytes(32).toString("hex");

      user.resetPasswordToken =
        crypto
          .createHash("sha256")
          .update(resetToken)
          .digest("hex");

      user.resetPasswordExpire =
        Date.now() + 10 * 60 * 1000;

      await user.save();

      const resetUrl =
        `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

      const transporter =
        nodemailer.createTransport({
          service: "gmail",

          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

      await transporter.sendMail({
        to: user.email,

        subject: "Password Reset Request",

        html: `
          <h2>Password Reset</h2>

          <p>
            Click the button below to reset your password.
          </p>

          <p>
            <a href="${resetUrl}">
              Reset Password
            </a>
          </p>

          <p>
            This link will expire in 10 minutes.
          </p>
        `,
      });

      res.status(200).json({
        success: true,
        message: "Reset link sent to email",
      });
    } catch (error) {
      console.error(
        "FORGOT PASSWORD ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// ================= RESET PASSWORD =================
// POST /api/auth/reset-password/:token

router.post(
  "/reset-password/:token",
  async (req, res) => {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password is required",
        });
      }

      const resetPasswordToken =
        crypto
          .createHash("sha256")
          .update(req.params.token)
          .digest("hex");

      const user = await User.findOne({
        resetPasswordToken,

        resetPasswordExpire: {
          $gt: Date.now(),
        },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid or expired reset token",
        });
      }

      const bcrypt =
        require("bcryptjs");

      const hashedPassword =
        await bcrypt.hash(password, 10);

      user.password = hashedPassword;

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      res.status(200).json({
        success: true,
        message:
          "Password reset successful",
      });
    } catch (error) {
      console.error(
        "RESET PASSWORD ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

module.exports = router;