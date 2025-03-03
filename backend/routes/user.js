const express = require("express");
const router = express.Router();
const User = require("../models/user"); // Import User model

// Route to save user details
router.post("/", async (req, res) => {
  const { userid, email } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ userid });

    if (!user) {
      // Create new user if not found
      user = new User({
        userid,
        email,
        lastVisit: new Date(),
      });
      await user.save();
    } else {
      // Update last visit timestamp
      user.lastVisit = new Date();
      await user.save();
    }

    res.status(200).json({ message: "User saved successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
