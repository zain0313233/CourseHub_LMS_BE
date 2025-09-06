const User = require("../models/user");
const Course = require("../models/course");
const Lectures = require("../models/leactures");
const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const {generateFilename,uploadImageToCloudinary}=require("../controller/cloudinarycontrollers")


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






router.post("/create", upload.single('thumbnail'), async (req, res) => {
  try {
    const {
      title,
      code,
      duration,
      category,
      price,
      teacher,
      description,
      syllabus,
      prerequisites,
      status
    } = req.body;

    
    const teacherExists = await User.findById(teacher);
    if (!teacherExists) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

   
    if (!['instructor', 'teacher'].includes(teacherExists.role)) {
      return res.status(400).json({
        success: false,
        message: "User must be an instructor or teacher to create courses"
      });
    }

    
    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: "Course code already exists"
      });
    }

    let thumbnailUrl = null;

    
    if (req.file) {
      const fileName = generateFilename(req.file.originalname);
      thumbnailUrl = await uploadImageToCloudinary(req.file.buffer, fileName);
      
      if (!thumbnailUrl) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload thumbnail image"
        });
      }
    }

    
    const newCourse = new Course({
      title,
      code,
      duration,
      category,
      price,
      teacher,
      description,
      syllabus: syllabus ? JSON.parse(syllabus) : [],
      prerequisites: prerequisites ? JSON.parse(prerequisites) : [],
      status: status || "Draft",
      thumbnail: thumbnailUrl
    });

    const savedCourse = await newCourse.save();

    
    await savedCourse.populate('teacher', 'name email role');

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: savedCourse
    });

  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});


router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const courses = await Course.find({ teacher: teacherId })
      .populate('teacher', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const totalCourses = await Course.countDocuments({ teacher: teacherId });
    const totalPages = Math.ceil(totalCourses / parseInt(limit));
    
    res.status(200).json({
      success: true,
      message: "Courses retrieved successfully",
      data: {
        courses,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCourses,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
    
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});


router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, search } = req.query;

   
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    
    const courses = await Course.find(query)
      .populate('teacher', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    
    const totalCourses = await Course.countDocuments(query);
    const totalPages = Math.ceil(totalCourses / parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Courses retrieved successfully",
      data: {
        courses,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCourses,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    
    const course = await Course.findById(id).populate('teacher', 'name email role profile.bio profile.experience');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

const lectures = await Lectures.find({ courseId: id }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: "Course retrieved successfully",
      coursedata:course,
      lectures
    });

  } catch (error) {
    console.error("Error fetching course:", error);
    
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

module.exports = router;