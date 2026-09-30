const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =====================================================
// GENERATE TOKEN
// =====================================================

const generateToken = (id, role) => {
  return jwt.sign(
    {
      id: id,
      role: role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};

// =====================================================
// REGISTER
// POST /api/auth/register
// =====================================================

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
    } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password and department are required",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const userExists = await User.findOne({
      email: normalizedEmail,
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    let userRole = "member";

    if (role) {
      const normalizedRole = String(role)
        .trim()
        .toLowerCase();

      if (
        ["admin", "manager", "member"].includes(
          normalizedRole
        )
      ) {
        userRole = normalizedRole;
      }
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: userRole,
      department: department.trim(),
    });

    const token = generateToken(
      user._id,
      user.role
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || "",
        phone: user.phone || "",
        address: user.address || "",
        photo: user.photo || "",
      },
    });
  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// =====================================================
// LOGIN
// POST /api/auth/login
// =====================================================

exports.login = async (req, res) => {
  try {
    console.log(
      "LOGIN REQUEST BODY:",
      {
        email: req.body?.email,
        passwordProvided:
          Boolean(req.body?.password),
      }
    );

    const email = String(
      req.body?.email || ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      req.body?.password || ""
    );

    // ================= VALIDATE INPUT =================

    if (!email || !password) {
      console.log(
        "LOGIN FAILED: EMAIL OR PASSWORD MISSING"
      );

      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    // ================= FIND USER =================

    const user = await User.findOne({
      email: email,
    });

    if (!user) {
      console.log(
        "LOGIN FAILED: USER NOT FOUND"
      );

      return res.status(400).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // ================= PASSWORD =================

    if (!user.password) {
      console.log(
        "LOGIN FAILED: PASSWORD NOT SET"
      );

      return res.status(400).json({
        success: false,
        message:
          "This account does not have a valid password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      console.log(
        "LOGIN FAILED: WRONG PASSWORD"
      );

      return res.status(400).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // ================= ROLE =================

    const role = String(
      user.role || "member"
    )
      .trim()
      .toLowerCase();

    if (
      !["admin", "manager", "member"].includes(
        role
      )
    ) {
      console.log(
        "LOGIN FAILED: INVALID ROLE:",
        user.role
      );

      return res.status(400).json({
        success: false,
        message:
          "User role is not configured correctly",
      });
    }

    // ================= TOKEN =================

    const token = generateToken(
      user._id,
      role
    );

    console.log(
      "LOGIN SUCCESS:",
      email,
      role
    );

    // ================= RESPONSE =================

    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        role: role,
        department: user.department || "",
        photo: user.photo || "",
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// =====================================================
// GET CURRENT USER
// GET /api/auth/me
// =====================================================

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error(
      "GET ME ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};