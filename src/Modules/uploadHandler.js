const multer = require('multer');
const path = require('path');
const { sqlQuery } = require('./sqlHandler');



// Multer storage configuration
const storage = multer.diskStorage({
  destination: 'uploads/', // Ensure this directory exists
  filename: (req, file, cb) => {
    const sanitizedFileName = file.originalname
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .replace(/\.[^/.]+$/, ''); // Remove extension

    cb(null, `${sanitizedFileName}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Allowed file types
const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mkv'];

// File filter
const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
  }
};

// Multer upload instance
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter
});

module.exports = { upload };
