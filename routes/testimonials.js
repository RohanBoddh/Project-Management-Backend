// routes/testimonials.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/", async (req, res) => {
  try {
    const users = await User.find()
      .limit(3)
      .select("name role");

    const quotes = [
      "This tool has revolutionized how we manage projects. Highly recommend!",
      "Easy to use and incredibly efficient. Our team productivity has doubled.",
      "Great features and support. Perfect for modern teams."
    ];

    const testimonials = users.map((user, index) => ({
      quote: quotes[index] || "Amazing tool!",
      name: user.name || "Anonymous",
      role: user.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
        : "User"
    }));

    res.status(200).json(testimonials);
  } catch (error) {
    console.error("Testimonials Error:", error);
    res.status(500).json({ message: "Error fetching testimonials" });
  }
});

module.exports = router;