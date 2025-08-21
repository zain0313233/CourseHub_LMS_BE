const express = require('express');
const {createBlog,getBlogById} = require('./../controller/blogController');
const multer = require("multer")
const router = express.Router();

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

router.post('/create', upload.single('thumbnail'), createBlog);
router.get('/teacher/:teacherid',getBlogById);
module.exports = router;