const User = require("../models/user");
const express = require("express");
const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }
     const user = await User.findById(id).select("-password");
     if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      message: "User data retrieved successfully",
      userdata: user
    });
  } catch (error) {
    console.error("Something went wrong:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
