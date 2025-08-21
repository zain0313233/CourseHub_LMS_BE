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
  cvUrl: {
    type: String,
    trim: true
  },
  videoUrl: { 
    type: String,
    trim: true
  },
  videotitle: {
    type: String,
    trim: true
  },
  vediodescription: {
    type: String,
    trim: true
  },
  profile: {
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
    followers: {
      type: Number,
      default: 0
    },
    batch: {
      type: String
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
    }
  },
  status: {
    type: String
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