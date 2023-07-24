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

// Set up the Multer middleware with validation
const imageFilter = (req, file, cb,res) => {
  // Check if the uploaded file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
      cb(new Error('Only image files are allowed!'), false);
  }
};
const categoryStorage= multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/temp');
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1]; 
    cb(null, `${Date.now()}-${file.originalname}`); 
  }
});

const uploadProduct= multer({ storage: productStorage ,
fileFilter:imageFilter,
limits:{
  fieldSize:5*1024*1024
}});
const uploadCategory= multer({ storage: categoryStorage,
  fileFilter:imageFilter,
  limits:{
    fieldSize:5*1024*1024
  }});


module.exports ={
  uploadProduct,
  uploadCategory}

