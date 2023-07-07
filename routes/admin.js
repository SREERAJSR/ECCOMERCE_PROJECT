var express = require("express");
var router = express.Router();
const {authenticateAdmin,authenticateForLogin} = require('../middlewares/middlware')
const {
  getLoginPage,
  loginAdmin,
  findUser_info,
  changeUserStatus,
  logoutAdmin
} = require("../controllers/admin-controller");

const {
  getaddProducts,
  addingProducts,
  getListProductPage,
  getEditProductPage,
  editProductAndSave,
  getCategoryPage,
  insertCategoryName,
  deleteProduct,
  getEditCategoryPage,
  editCategoryName,
  deleteCategory,
  getUnlistedPage,
  changeCategoryStatus,
  getUnlistProductPage,
  changeProductStatus
} = require("../controllers/product-controller");

// const upload = require("../middlewares/multer-config")
const multer = require("multer");
const  {uploadProduct,uploadCategory} = require("../middlewares/multer-config");

router.get("/",authenticateAdmin,(req, res) => {
  res.render("admin/dashboard", { admin: true });
});

router.get('/admin-login',authenticateForLogin, getLoginPage)

router.post('/admin-login',loginAdmin)

router.get('/admin-logout',authenticateAdmin, logoutAdmin)

router.get("/user-manage",authenticateAdmin, findUser_info);

router.patch("/userManage",authenticateAdmin, changeUserStatus);

router.get("/add-product", getaddProducts); 

router.post("/add-product",authenticateAdmin, uploadProduct.array("images", 4), addingProducts);

router.post("/add-category",authenticateAdmin,uploadCategory.single("images", 1),  insertCategoryName,);

router.get("/edit-category",authenticateAdmin, getEditCategoryPage);

router.post("/edit-category", authenticateAdmin,uploadCategory.single("images", 1),editCategoryName);

router.patch("/delete-category",authenticateAdmin, deleteCategory);

router.get('/unlisted-category',authenticateAdmin,getUnlistedPage);

router.patch('/unlistCategory',authenticateAdmin,changeCategoryStatus)

router.get("/category",authenticateAdmin, getCategoryPage);

router.get("/list-products",authenticateAdmin, getListProductPage);

router.get("/edit-product",authenticateAdmin, getEditProductPage);

router.post("/edit-product", authenticateAdmin,uploadProduct.array("images", 4), editProductAndSave);

router.patch("/delete-product",authenticateAdmin, deleteProduct);

router.get("/unlist-product",authenticateAdmin,getUnlistProductPage)

router.patch('/unlistproduct',authenticateAdmin,changeProductStatus)

module.exports = router;
