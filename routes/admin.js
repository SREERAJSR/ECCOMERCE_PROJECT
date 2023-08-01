var express = require("express");
var router = express.Router();
const {authenticateAdmin,authenticateForLogin} = require('../middlewares/middlware')
const {
  getLoginPage,
  loginAdmin,
  findUser_info,
  changeUserStatus,
  logoutAdmin,
  getDashBoardPage,
  getSalesReportPage,
  fetchingSalesReport,
  getAdminOrderListPage,
  getAdminOrderDetailPage,
  changeOrderItemStatus
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
  changeProductStatus,
  getCouponPage,
  addingCoupon,
  getInventoryManagementPage,
  changeInventoryStatus
} = require("../controllers/product-controller");

// const upload = require("../middlewares/multer-config")
const multer = require("multer");
const  {uploadProduct,uploadCategory} = require("../middlewares/multer-config");


router.get('/admin-login',authenticateForLogin, getLoginPage)

router.get("/", authenticateAdmin,getDashBoardPage)
router.post('/admin-login',loginAdmin)


router.get('/admin-logout',authenticateAdmin, logoutAdmin)

router.get("/user-manage",authenticateAdmin, findUser_info);

router.patch("/userManage",authenticateAdmin, changeUserStatus);

router.get("/add-product", authenticateAdmin, getaddProducts); 

router.post("/add-product",authenticateAdmin, uploadProduct.array("images", 4), addingProducts);

router.post("/add-category",authenticateAdmin,uploadCategory.single("images", 1),  insertCategoryName,);

router.get("/edit-category",authenticateAdmin, getEditCategoryPage);

router.post("/edit-category", authenticateAdmin,uploadCategory.single("images", 1),editCategoryName);

router.patch("/delete-category",authenticateAdmin, deleteCategory);

router.get('/unlisted-category',authenticateAdmin,getUnlistedPage);

router.patch('/unlistCategory',authenticateAdmin,changeCategoryStatus)

router.get("/category",authenticateAdmin, getCategoryPage);

router.get("/list-products",authenticateAdmin, getListProductPage);

router.get('/inventory_manage', authenticateAdmin,getInventoryManagementPage)

router.patch('/inventory_manage', authenticateAdmin,changeInventoryStatus)

router.get("/edit-product",authenticateAdmin, getEditProductPage);

router.post("/edit-product", authenticateAdmin,uploadProduct.array("images", 4), editProductAndSave);

router.patch("/delete-product",authenticateAdmin, deleteProduct);

router.get("/unlist-product",authenticateAdmin,getUnlistProductPage)

router.patch('/unlistproduct',authenticateAdmin,changeProductStatus)

router.get('/add-coupon',authenticateAdmin,getCouponPage)

router.post('/add-coupon',authenticateAdmin,addingCoupon)

router.get('/sales_report',authenticateAdmin,getSalesReportPage)

router.post('/sales_report',authenticateAdmin,fetchingSalesReport)

router.get('/order_list',authenticateAdmin,getAdminOrderListPage)

router.get('/order_details',authenticateAdmin,getAdminOrderDetailPage)


router.patch('/change_Order_Status',authenticateAdmin,changeOrderItemStatus)



module.exports = router;
