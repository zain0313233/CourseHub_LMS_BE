const User = require("../models/user");
const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  }
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImageTocloudinary = async (buffer, fileName) => {
  try {
    const base64Data = buffer.toString("base64");
    const dataUri = `data:image/jpeg;base64,${base64Data}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      public_id: fileName,
      resource_type: "image"
    });
    console.log("Cloudinary upload successful:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    
    return null;
  }
};

function generateFilename(originalName) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  return `${timestamp}_${randomString}${extension}`;
}

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

router.put("/:id/profile-image", upload.single("profileImage"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileName = generateFilename(req.file.originalname);
    const imageUrl = await uploadImageToCloudinary(req.file.buffer, fileName);

    if (!imageUrl) {
      return res.status(500).json({ message: "Image upload failed" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { profileImageUrl: imageUrl, updatedAt: Date.now() },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile image updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
