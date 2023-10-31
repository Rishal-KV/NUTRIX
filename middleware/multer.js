const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/product/img');
  },
  filename: (req, file, cb) => {
    // Generate a unique filename for the uploaded file
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  },
});

const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/banner/img');
  },
  filename: (req, file, cb) => {
    // Generate a unique filename for the uploaded file
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  },
});

exports.upload = multer({ storage });
exports.bannerUpload = multer({ storage: bannerStorage }); // Use the correct storage configuration here
