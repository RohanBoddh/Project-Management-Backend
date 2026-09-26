// workUpload.js

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 🔥 Storage Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/work/";

    // ✅ Automatically create folder if not exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// 🔥 File Type Filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/zip",
    "image/jpeg",
    "image/png",
    "video/mp4",
    "text/plain",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

// 🔥 Multer Export
module.exports = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});