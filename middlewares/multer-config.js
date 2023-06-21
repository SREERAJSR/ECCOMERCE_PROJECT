// multerConfig.js
const multer = require('multer');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads'); // Specify the destination folder
  },
  filename: function (req, file, cb) {
    const uniquePrefix = Date.now() + '-';
    cb(null, uniquePrefix + file.originalname); // Generate the filename
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
