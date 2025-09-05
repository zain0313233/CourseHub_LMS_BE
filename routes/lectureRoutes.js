const express = require("express");
const router = express.Router();
const multer = require("multer");
const Course = require("../models/course");
const Lectures = require("../models/leactures");
const aws = require("../config/awsconfig");
const {
  generateFilename,
  uploadImageToCloudinary,
  uploadVideoToCloudinary,
} = require("../controller/cloudinarycontrollers");

const s3 = new aws.S3();

const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
    // ACL: "public-read",
  };
  const result = await s3.upload(params).promise();
  return result.Location;
};

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "video/",
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];
    if (
      file.mimetype.startsWith("video/") ||
      allowedTypes.includes(file.mimetype)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only video, PDF, and PPT files are allowed!"), false);
    }
  },
});


router.post("/upload-lecture", upload.single("file"), async (req, res) => {
  try {
    const {
      title,
      description,
      courseId,
      contentType,
      duration,
      order,
      isPreview,
    } = req.body;

    if (!title || !courseId || !contentType || !req.file || !order) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const course = await Course.findById(courseId); 
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    let contentUrl;
    if (contentType === "Video") {
      const result = await uploadVideoToCloudinary(
        req.file.buffer,
        generateFilename()
      );
      contentUrl = result.url || result.secure_url; 
    } else {
      contentUrl = await uploadToS3(
        req.file.buffer,
        generateFilename(req.file.originalname),
        req.file.mimetype
      );
    }

    const newLecture = {
      title,
      description,
      courseId,
      contentType,
      contentUrl,
      duration,
      order,
      isPreview: isPreview === "true",
    };

    const lecture = new Lectures(newLecture);
    await lecture.save();

    res
      .status(200)
      .json({ message: "Lecture uploaded successfully", lecture: newLecture });
  } catch (error) {
    console.error("Error uploading lecture:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
