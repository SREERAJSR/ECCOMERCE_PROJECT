const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/product_images');
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${Date.now()}-${file.originalname}.${ext}`); 
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
