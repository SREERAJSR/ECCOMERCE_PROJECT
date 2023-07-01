const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const twilio = require("twilio");
const userHelpers = require("../helpers/user-helpers");
const category = require("../models/categorySchema");
const { clearCache } = require("ejs");
const { findCategory } = require("../helpers/product-helpers");
const Product = require("../models/productSchema");
const { categoryWiseFiltering } = require("../helpers/product-helpers");
const { error } = require("jquery");
const { default: mongoose } = require("mongoose");

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
      res.render("user/login", { u: false });
    }
  },

  postLogin: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ Email: email });
      if (!user) {
        const emailErr = "invalid email";
        return res.render("user/login", { u: false, emailErr });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);

      if(passwordMatch){
        req.session.user =user
      }

     
      // const UserDetails = req.session.user;

      if (passwordMatch && user.isActive === true && req.session.user) {
        res.redirect("/");
      } else if (passwordMatch && user.isActive === false) {
        res.redirect("/login");
      } else if (!passwordMatch) {
        const passErr = "incorrect password";
        res.render("user/login", { u: false, passErr });
      }
    } catch (err) {
      console.log(err);
    }
  },
  loginOtp: (req, res) => {
    res.render("user/numberOtp", { u: false });
  },

  userLogout: (req, res) => {
    if (req.session.user) {
      console.log(req.session);
      req.session.destroy((err) => {
        res.redirect("/"); // will always fire after session is destroyed
      });
    }
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
      // req.session.phone = phone;
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
        .then(async (verification_check) => {
          console.log(verification_check.status);

          // Remove '+91' from the phone number
          const formattedPhone = phone.substring(3);
          const user = await User.findOne({ phone: formattedPhone });

          console.log(user);
          req.session.user = user;
          if (user.isActive) {
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
      const { phone } = req.query;
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
        })
        .catch((err) => {
          console.log(err);
        })
        .catch((err) => {
          res.status(401).json({ message: "Invalid Otp" + err });
        });
    } catch (err) {
      console.log("ERROR IN OTP" + err);
    }
  },
  getForgotpasswordPage: (req, res) => {
    res.render("user/forgot-password", { u: false });
  },
  forgotPasswordSendOtp: async (req, res) => {
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
      // req.session.phone = phone;
      res.render("user/forgot-password-otp", { u: false, userPhone });
      // res.redirect(`/otp/${phone}`);
    } catch (err) {
      console.log(err);
    }
  },
  forgotPasswordOtpVerification: async (req, res) => {
    try {
      const phone = req.params.id;
      const { otp1, otp2, otp3, otp4, otp5, otp6 } = req.body;
      const otpcode = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`;
      const client = twilio(process.env.accountSid, process.env.authToken);

      await client.verify.v2
        .services(process.env.verifySid)
        .verificationChecks.create({ to: phone, code: otpcode })
        .then(async (verification_check) => {
          console.log(verification_check.status);

          // Remove '+91' from the phone number
          const formattedPhone = phone.substring(3);
          const user = await User.findOne({ phone: formattedPhone });
          

          if (user.isActive) {
            res.render("user/confirm-password", { u: false ,user  });
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
  passwordValidationForConfirm: async(req, res) => {
    

    try{
      const{phone} = req.query
      const { newpassword, confirmpassword } = req.body;
      if(newpassword ===   confirmpassword){
        

        console.log(phone);
  
       const user = await User.findOne({phone:phone})
       console.log('haihaihaighiagihgahgi',user);

       const hashedpassword=  await bcrypt.hash(newpassword,10)
       console.log(hashedpassword);
       user.password = hashedpassword
        
     await  user.save()
// Redirect with a success message
req.flash('success','password changed succesfully')
res.redirect('/login')
        
      }else{

        const mismatchPassword = "entered passwords do not  match"

        res.render('user/confirm-password',{u:false,mismatchPassword})      }
     
    }catch(err){
      res.render('error', { error: 'An error occurred' });


    }
    
  },

  /////////////////////////////////////////User//////////////////////////////////////////////////////////
  getHomePage: async (req, res) => {
    try {
      findCategory().then(async (categories) => {
        let filter = {};
        filter = await Promise.all(
          categories.map(async (category) => {
            const resp = await Product.find({
              "Category.categoryName": category.CategoryName,
            });
            return { resp };
          })
        );
        const gaming = filter[0].resp;
        const office = filter[1].resp;
        const students = filter[2].resp;
        const userDetails = req.session.user;

        if (req.session.user) {
          const userPhone = req.session.user.phone;

          const user = await User.findOne({ phone: userPhone });
          if (user.isActive === true) {
            res.render("user/homepage", {
              u: true,
              categories,
              gaming,
              office,
              students,
              userDetails,
            });
          } else {
            res.render("user/homepage", {
              u: true,
              categories,
              gaming,
              office,
              students,
            });
          }
        } else {
          res.render("user/homepage", {
            u: true,
            categories,
            gaming,
            office,
            students,
          });
        }
      });
    } catch (error) {
      // Handle the error appropriately
    }
  },
  getProductPage: async (req, res, next) => {
    try {
      findCategory().then(async (categories) => {
        let filter = {};
        filter = await Promise.all(
          categories.map(async (category) => {
            const res = await Product.find({
              "Category.categoryName": category.CategoryName,
            });

            return { res };
          })
        );
        const gaming = filter[0].res;
        const office = filter[1].res;
        const students = filter[2].res;
        if (req.session.user) {
          const userPhone = req.session.user.phone;
          const userDetails = req.session.user;
          const user = await User.findOne({ phone: userPhone });
          if (user.isActive === true) {
            res.render("user/view-products", {
              u: true,
              categories,
              gaming,
              office,
              students,
              userDetails,
            });
          } else {
            res.render("user/view-products", {
              u: true,
              categories,
              gaming,
              office,
              students,
            });
          }
        } else {
          res.render("user/view-products", {
            u: true,
            categories,
            gaming,
            office,
            students,
          });
        }
      });
    } catch (error) {
      // Handle the error appropriately
    }
  },
  getShopPage:async(req,res)=>{
    
    try{
      const products = await Product.aggregate([{$match:{isActive:true}}])

      console.log(products);

      if(products){
        res.render('user/shop',{u:true,products})
      }else{

        res.status(401).json({ message: "products not find" + err });
      }

    }catch{
      res.status(401).json({ message: "products to shop page error" + err });
    }
 

  },

  getProductDetailPage: async (req, res, next) => {
    try {
      const { productId } = req.query;
      const categoryId = req.query.categoryId.trim();
      console.log(categoryId);

      const catProd = await Product.aggregate([
        {
          $match: {
            "Category.categoryId": new mongoose.Types.ObjectId(categoryId),
          },
        },
      ]);

      await Product.findById(productId)
        .then(async (product) => {
          if (product) {
            if (req.session.user) {
              const userPhone = req.session.user.phone;
              const userDetails = req.session.user;
              const user = await User.findOne({ phone: userPhone });
              if (user.isActive === true) {
                res.render("user/product-details", {
                  u: true,
                  product,
                  catProd,
                  userDetails,
                });
              } else {
                res.render("user/product-details", {
                  u: true,
                  product,
                  catProd,
                });
              }
            } else {
              res.render("user/product-details", { u: true, product, catProd });
            }
          } else {
            res.redirect("/view-products");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err });
    }
  },
};
