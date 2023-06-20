const {authenticateSession} =require('../middlewares/middlware')
const rateLimiter =require('express-rate-limit')
var express = require("express");
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
  validateSignUp

} = require("../controllers/userController");
//SHA256:CXoHORZsVoQiTlBkcwyCuTYWR29M0IyeXdcy8GYOnfY sreerajsr03@gmail.com

// Apply rate limiting middleware
const limiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Allow a maximum of 5 requests within the defined window
});
/* GET users listing. */
router.get("/", authenticateSession, function (req, res, next) {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.render("user/homepage", { u: true });
});

router.get("/view-products",authenticateSession, (req, res, next) => {
  res.render("user/view-products", { u: true });
});

router.get("/product-details", function (req, res, next) {
  res.render("user/product-details", { u: true });
});

router.get("/shopping-cart", (req, res, next) => {
  res.render("user/shopping-cart",{u:true});
});

router.get("/contact", (req, res, next) => {
  res.render("user/contact",{u:true});
});

router.get("/signup", getSignup);

router.post("/signup", userSignup);

router.get('/otp-signup',signupOtp)

router.get("/login", getLogin);

router.post("/login", postLogin);

router.get("/otp-number", loginOtp);

router.post("/send-otp", limiter, sendOtp);

// router.get('/otp',getotpVerificationPage)

router.post("/otp-signup/:id", otpVerification);

router.get('/resend-otp/:id',resendOtp)

router.post('/user-signUp-otp',validateSignUp)

module.exports = router;
