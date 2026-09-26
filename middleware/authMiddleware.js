// middleware/authMiddleware.js (updated to make role check case-insensitive)
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ================= PROTECT =================
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "No token, not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token failed" });
  }
};

// ================= AUTHORIZE ROLES =================
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    // Make role check case-insensitive
    const userRole = req.user.role.toLowerCase();
    if (!roles.some(role => role.toLowerCase() === userRole)) {
      return res.status(403).json({
        message: `Role ${req.user.role} not allowed. Required: ${roles.join(", ")}`,
      });
    }
    next();
  };
};