const mongoose = require("mongoose");

const blogschema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    views: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["Published", "Archived", "Draft", "Completed"],
      default: "Draft"
    },
    content: {
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
  },
  {
    timestamps: true
  }
);
blogschema.index({ teacher: 1 });
blogschema.index({ category: 1 });
module.exports = mongoose.model("Blogs", blogschema);
