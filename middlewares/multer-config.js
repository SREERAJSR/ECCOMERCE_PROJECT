const multer = require('multer');
const sharp = require("sharp");
const productStorage= multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/temp');
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${Date.now()}-${file.originalname}`); 
  }
});
const categoryStorage= multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/category_images');
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${Date.now()}-${file.originalname}`); 
  }
});

const uploadProduct= multer({ storage: productStorage });
const uploadCategory= multer({ storage: categoryStorage});


module.exports ={
  uploadProduct,
  uploadCategory}

