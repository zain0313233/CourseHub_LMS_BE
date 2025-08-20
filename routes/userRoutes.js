const User = require("../models/user");
const express = require("express");
const { getGoogleDriveAuth } = require("../config/googledrive");
const { google } = require("googleapis");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const { Readable } = require("stream");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB for videos
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed!"), false);
    }
  }
});

function BufferToStream(buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

const uploadVideoToDrive = async (fileBuffer, fileName, mimeType) => {
  try {
    const auth = getGoogleDriveAuth();
    const drive = google.drive({ version: "v3", auth });

    
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDERID] 
      },
      media: {
        mimeType: mimeType,
        body: BufferToStream(fileBuffer), 
      },
      fields: "id,name,webViewLink",
    });

    const fileId = response.data.id;

    
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    
    const fileUrl = `https://drive.google.com/file/d/${fileId}/view`;

    console.log("Drive upload successful:", fileUrl);
    return fileUrl;
  } catch (error) {
    console.error("Drive upload error:", error);
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
    const fileUrl = await uploadVideoToDrive(
      req.file.buffer,
      fileName,
      req.file.mimetype
    );

    if (!fileUrl) {
      return res.status(500).json({
        success: false,
        message: "Video upload to Google Drive failed"
      });
    }

    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { 
        videoUrl: fileUrl, 
        updatedAt: new Date()
      }, 
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Video uploaded successfully",
      user: updatedUser,
      videoUrl: fileUrl
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