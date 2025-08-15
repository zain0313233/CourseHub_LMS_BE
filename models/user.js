const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  phone: {
    type: String,
    trim: true
  },

  country: {
    type: String,
    trim: true
  },

  address: {
    type: String,
    trim: true
  },

  dateOfBirth: {
    type: Date
  },

  password: {
    type: String,
    required: true,
    minlength: 6
  },

  role: {
    type: String,
    enum: ["student", "instructor", "admin", "teacher"],
    default: "student"
  },
  profileImageUrl: {
    type: String, 
    trim: true
  },

  bio: {
    type: String,
    trim: true
  },

  educationLevel: {
    type: String,
    trim: true
  },
  experience: {
    type: Number
  },

  subjects: [
    {
      type: String,
      trim: true
    }
  ],
  learningGoals: {
    type: String,
    trim: true
  },
  cvUrl: {
    type: String,
    trim: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
