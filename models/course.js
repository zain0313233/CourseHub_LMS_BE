const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: String,
    required: true,
    trim: true
  },
  thumbnail: {
    type: String,
    trim: true
  },
  students: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["Active", "Inactive", "Draft", "Completed"],
    default: "Draft"
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  syllabus: [
    {
      type: String,
      trim: true
    }
  ],
  prerequisites: [
    {
      type: String,
      trim: true
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true 
});


courseSchema.index({ teacher: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ status: 1 });

module.exports = mongoose.model("Course", courseSchema);