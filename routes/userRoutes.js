const User = require("../models/user");
const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const Course = require("../models/course");
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
    if (file.mimetype.startsWith("video/") || file.mimetype.startsWith("image/")) {
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
const uploadImageToCloudinary = async (buffer, fileName) => {
  try{
    const base64Data=buffer.toString("base64");
    const dataUri=`data:image/jpeg;base64,${base64Data}`;
    const result=await cloudinary.uploader.upload(dataUri,{
      public_id:fileName,
      resource_type:"image",
      folder:"profile_pictures",
      transformation:[
        {width:500, height:500, crop:"fill"},
        {quality:"auto"},
        {fetch_format:"auto"}
      ]
    });
    console.log("Cloudinary image upload successful:", result.secure_url);
    return result.secure_url;
  }catch(error){
    console.error("Cloudinary image upload error:", error);
    return null;
  }
}

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
router.get('/role/:role', async (req, res) => {
  try {
    const { role } = req.params;
    
    if (!role) {
      return res.status(400).json({ message: "Role parameter is required" });
    }

    const users = await User.find({ role: role }).select("-password");
    
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found with the specified role" });
    }
    if (role === "teacher") {
      const usersWithCourses = await Promise.all(
        users.map(async (user) => {
          const teacherCourses = await Course.find({ teacher: user._id });
          return {
            ...user.toObject(),
            courses: teacherCourses
          };
        })
      );

      return res.status(200).json({
        message: "Teachers retrieved successfully",
        users: usersWithCourses
      });
    }

    return res.status(200).json({
      message: "Users retrieved successfully",
      users: users
    });

  } catch (error) {
    console.error("Something went wrong:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id/video", upload.single("video"), async (req, res) => {
  try {
    const { id } = req.params;
    const {videotitle, vediodescription} = req.body;

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
      { vediotitle: videotitle,
        vediodescription: vediodescription,
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
router.patch("/:id/upload-profile-picture", upload.single("image"), async (req, res) => {
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