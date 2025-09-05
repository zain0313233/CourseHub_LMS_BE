const User = require("../models/user");
const Blogs = require("../models/blogs");
const path = require("path");
const {generateFilename,uploadImageToCloudinary}=require("../controller/cloudinarycontrollers")

const createBlog = async (req, res) => {
  try {
    const { title, category, teacher, status, content } = req.body;
    const thumbnail = req.file;

    const teacherExists = await User.findById(teacher);
    if (!teacherExists) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    if (!["instructor", "teacher"].includes(teacherExists.role)) {
      return res.status(400).json({
        success: false,
        message: "User must be an instructor or teacher to create courses"
      });
    }

    if (!title || !category || !teacher || !status || !content) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (!thumbnail) {
      return res.status(400).json({
        success: false,
        message: "Thumbnail image is required"
      });
    }

    const existingBlog = await Blogs.findOne({ title });
    if (existingBlog) {
      return res.status(400).json({
        success: false,
        message: "Blog with this title already exists"
      });
    }

    const fileName = generateFilename(thumbnail.originalname);
    const imageUrl = await uploadImageToCloudinary(thumbnail.buffer, fileName);

    if (!imageUrl) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload image"
      });
    }

    const newBlog = new Blogs({
      title,
      category,
      teacher,
      status: status || "Draft",
      content,
      thumbnail: imageUrl
    });

    const savedBlog = await newBlog.save();
    await savedBlog.populate("teacher", "name email role");

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog: savedBlog
    });

  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getBlogById=async(req,res)=>{
try{
  const {teacherid}=req.params;
  const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
  const blogs =await Blogs.find({teacher:teacherid}).populate("teacher", "name email role").sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
  if (!blogs || blogs.length === 0) {
    return res.status(404).json({ message: "No blogs found for this teacher" });
  }
  return res.status(200).json({
    success: true,
    message: "Blogs fetched successfully",
    data: blogs
  });

}catch(error){
    console.error("Error fetching blog by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  createBlog,
  getBlogById
};