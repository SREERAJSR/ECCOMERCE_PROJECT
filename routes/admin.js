var express = require("express");
var router = express.Router();
const {authenticateAdmin,authenticateForLogin} = require('../middlewares/middlware')
const {
  getLoginPage,
  loginAdmin,
  findUser_info,
  changeUserStatus,
  getaddProducts,
  addingProducts,
  insertCategoryName,
  getListProductPage,
  getEditProductPage,
  editProductAndSave,
} = require("../controllers/admin-controller");

const {
  getCategoryPage,
  deleteProduct,
  getEditCategoryPage,
  editCategoryName,
  deleteCategory,
} = require("../controllers/product-controller");

// const upload = require("../middlewares/multer-config")
const multer = require("multer");
const upload = require("../middlewares/multer-config");

router.get("/",authenticateAdmin,(req, res) => {
  res.render("admin/list-users", { admin: true });
});

router.get('/admin-login',authenticateForLogin, getLoginPage)

router.post('/admin-login',loginAdmin)

router.get("/user-manage",authenticateAdmin, findUser_info);

router.patch("/userManage",authenticateAdmin, changeUserStatus);

router.get("/add-product", getaddProducts); 

router.post("/add-product",authenticateAdmin, upload.array("images", 4), addingProducts);

router.post("/add-category",authenticateAdmin, insertCategoryName);

router.get("/edit-category",authenticateAdmin, getEditCategoryPage);

router.post("/edit-category", authenticateAdmin,editCategoryName);

router.delete("/delete-category",authenticateAdmin, deleteCategory);

router.get("/category",authenticateAdmin, getCategoryPage);

router.get("/list-products",authenticateAdmin, getListProductPage);

router.get("/edit-product",authenticateAdmin, getEditProductPage);

router.post("/edit-product", authenticateAdmin,upload.array("images", 4), editProductAndSave);

router.delete("/delete-product",authenticateAdmin, deleteProduct);

module.exports = router;
