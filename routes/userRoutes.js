const User = require("../models/user");
const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed!"), false);
    }
  }
});

const uploadVideoToCloudinary = async (buffer, fileName) => {
  try {
    const base64Data = buffer.toString("base64");
    const dataUri = `data:video/mp4;base64,${base64Data}`;
    
    const result = await cloudinary.uploader.upload(dataUri, {
      public_id: fileName,
      resource_type: "video",
      folder: "user_videos", 
      transformation: [
        { quality: "auto" }, 
        { format: "mp4" }
      ]
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

router.patch("/:id/video", upload.single("video"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video file uploaded"
      });
    }

   
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const fileName = generateFilename(req.file.originalname);
    const videoUrl = await uploadVideoToCloudinary(req.file.buffer, fileName);

    if (!videoUrl) {
      return res.status(500).json({
        success: false,
        message: "Video upload to Cloudinary failed"
      });
    }

   
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { 
        videoUrl: videoUrl,
        updatedAt: new Date()
      }, 
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Video uploaded successfully",
      user: updatedUser,
      videoUrl: videoUrl
    });

  } catch (error) {
    console.error("Route error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

module.exports = router;