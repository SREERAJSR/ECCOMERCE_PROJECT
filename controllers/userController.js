const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const twilio = require("twilio");
const userHelpers = require("../helpers/user-helpers");
const category = require('../models/categorySchema')
const { clearCache } = require("ejs");
const {findCategory}= require('../helpers/product-helpers')
const Product = require("../models/productSchema");
const {categoryWiseFiltering}= require('../helpers/product-helpers')


module.exports = {
  getSignup: (req, res) => {
    // console.log(req.session.user.username);
    res.render("user/signup", { u: false });
  },

  userSignup: async (req, res) => {
    try {
      const { username, phone, email, password } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);
      console.log(hashedPassword);
      const newUser = new User({
        Name: username,
        phone: phone,
        Email: email,
        password: hashedPassword,
        isActive: true,
      });
      await newUser
        .save()
        .then(() => {
          // req.session.user = newUser;
          //req.session.phone=phone
          console.log(req.session.user);
          userHelpers.sendingOtp(phone).then(() => {
            const userPhone = "+91" + phone;
            res.render("user/user-signUp-otp", { u: false, userPhone });
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch {
      res.status(500).json({ message: "User failed signup" });
    }
  },

  signupOtp: (req, res) => {
    res.render("user/otp-signup", { u: false });
  },
 
  getLogin: (req, res) => {

    if (req.session.user) {

      console.log(req.session);
      console.log("haii");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.redirect("/");
    } else { 
      console.log("no hai");
     res.render('user/login',{u:false})
    }
  },

  postLogin: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ Email: email });
      if (!user) { 
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);




      if (passwordMatch) {
        req.session.user=user
        res.redirect("/");
      } else {
        res.redirect("/login");
      }
    } catch (err) {
      console.log(err);
    }
  },
  loginOtp: (req, res) => {
    res.render("user/numberOtp", { u: false });
  },

  sendOtp: async (req, res) => {
    try {
      const { phone } = req.body;
      // Set up the Twilio client with your Account SID and Auth Token
      const accountSid = process.env.accountSid;
      const authToken = process.env.authToken;
      const client = twilio(accountSid, authToken);
      await client.verify.v2
        .services(process.env.verifySid)
        .verifications.create({ to: "+91" + phone, channel: "sms" });
      const userPhone = "+91" + phone;
      req.session.phone = phone;
      res.render("user/otp-signup", { u: false, userPhone });
      // res.redirect(`/otp/${phone}`);
    } catch (err) {
      console.log(err);
    }
  },
  otpVerification: async (req, res) => {
    try {
      const phone = req.params.id;
      const { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body;
      const otpcode = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`;
      const client = twilio(process.env.accountSid, process.env.authToken);

      await client.verify.v2
        .services(process.env.verifySid)
        .verificationChecks.create({ to: phone, code: otpcode })
        .then((verification_check) => {
          console.log(verification_check.status);

          if (req.session.phone) {
            res.redirect("/");
          } else {
            res.redirect("/login");
          }
        })
        .catch((err) => {
          res.status(401).json({ message: "Invalid Otp" + err });
        });
    } catch (err) {
      console.log("ERROR IN OTP" + err);
    }
  },
  resendOtp: async (req, res) => {
    try {
      const phone = req.params.id;
      // Set up the Twilio client with your Account SID and Auth Token
      const accountSid = process.env.accountSid;
      const authToken = process.env.authToken;
      const client = twilio(accountSid, authToken);
      await client.verify.v2
        .services(process.env.verifySid)
        .verifications.create({ to: phone, channel: "sms" });
      const userPhone = phone;
      res.render("user/otp-signup", { u: false, userPhone });
      // res.redirect(`/otp/${phone}`);
    } catch (err) {
      console.log(err);
    }
  },
  validateSignUp: async (req, res) => {
    try {
      const{phone} = req.query
      const { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body;
      const otpcode = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`;
      console.log(otpcode);
      console.log("SSSSSSSŠ" + phone);
      // const phone = req.session.phone;

      userHelpers
        .validating(phone, otpcode)
        .then((sucess) => {
          if (sucess) {

            res.redirect("/login");
          }
        }).catch((err)=>{
          console.log(err);
        })
        .catch((err) => {
          res.status(401).json({ message: "Invalid Otp" + err });
        });
    } catch (err) {
      console.log("ERROR IN OTP" + err);
    }
  },

  /////////////////////////////////////////User//////////////////////////////////////////////////////////
  getHomePage: async (req, res) => {
    try {
      findCategory().then(async (categories) => {
        let filter ={}
         filter= await Promise.all(
          categories.map(async (category) => {
         
         const res  =await Product.find({ 'Category.categoryName': category.CategoryName });

         return {res}
          })
        );

        const gaming = filter[0].res
        const office = filter[1].res
        const students = filter[2].res
        console.log("haiiii", gaming);
  
        res.render("user/homepage", { u: true, categories ,gaming,office,students });
      });
    } catch (error) {
      // Handle the error appropriately
    }
  }
  


   
  
};

