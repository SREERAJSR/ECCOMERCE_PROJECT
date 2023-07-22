const {authenticateSession,authenticateForUser} =require('../middlewares/middlware')
const rateLimiter =require('express-rate-limit')
const User = require("../models/userSchema");
var express = require("express");
const { addToCart,
  getShoppingCart,
  updateQuantity,
  deleteCartItem,
  applyCoupon,
  placingOrder,
  verifyPayment}= require('../controllers/Order-controller')

var router = express.Router();
const {
  resendOtp,
  userSignup, 
  getLogin,
  postLogin,
  getSignup,
  loginOtp,
  sendOtp,
  otpVerification,
  signupOtp,
  validateSignUp,
  getHomePage,
  getProductPage,
  getShopPage,
  getProductDetailPage,
  userLogout,
  getForgotpasswordPage,
  forgotPasswordSendOtp,
  forgotPasswordOtpVerification,
  passwordValidationForConfirm ,
  getWishlistPage,
  checkWishlist,
  addToWishlist,
  removeFromWishlist,
  addingAddress,
  getCheckoutPage,
  selectDefaultAddress,
  sortSearchFilterPagination

} = require("../controllers/userController");
//SHA256:CXoHORZsVoQiTlBkcwyCuTYWR29M0IyeXdcy8GYOnfY sreerajsr03@gmail.com

// Apply rate limiting middleware
const limiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Allow a maximum of 5 requests within the defined window
});
/* GET users listing. */

router.get("/login",authenticateSession, getLogin);

router.post("/login", postLogin);

router.get("/", getHomePage)

router.get("/view-products", getProductPage)


router.get('/shop',getShopPage)

router.post('/shop',sortSearchFilterPagination) 

router.get("/product-details", getProductDetailPage)


router.get("/contact", (req, res, next) => {
  res.render("user/contact",{u:true});
});

router.get("/signup", getSignup);

router.post("/signup", userSignup);

router.get('/otp-signup',signupOtp)

router.get('/forgot-password' , getForgotpasswordPage)

router.post('/forgot-password-sendingOtp', forgotPasswordSendOtp)
router.post('/otp-forgotpassword/:id',forgotPasswordOtpVerification )

router.post('/confirm-password',passwordValidationForConfirm)


router.get('/logout',userLogout)

router.get("/otp-number", loginOtp);

router.post("/send-otp", limiter, sendOtp); 



// router.get('/otp',getotpVerificationPage) 

router.post("/otp-signup/:id", otpVerification);

router.get('/resend-otp/:id',resendOtp)

router.post('/user-signUp-otp',validateSignUp)


router.get('/wishlist', authenticateSession ,getWishlistPage)
router.get('/check_wishlist',checkWishlist)
router.post('/add_to_wishlist',addToWishlist)

router.delete('/remove_from_wishlist',removeFromWishlist)


//////cart-- start//////

router.post('/add-to-cart',addToCart)

router.get('/shopping-cart',authenticateSession,  getShoppingCart)

router.patch('/updateQuantity',authenticateSession ,updateQuantity)

router.delete('/deleteCartItem',authenticateSession,deleteCartItem)

router.post('/apply-coupon',authenticateSession ,applyCoupon)

router.get("/checkout",authenticateSession,getCheckoutPage)

router.post('/add_address',addingAddress)

router.post('/select_Default_address',selectDefaultAddress)


router.post('/place_order',placingOrder)

router.get('/order_success',(req,res)=>{
  res.render('user/order-sucess',{u:true})
})
router.post('/verify_payment',verifyPayment)
module.exports = router;
