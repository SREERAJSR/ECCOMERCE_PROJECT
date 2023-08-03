const Cart = require("../models/cartSchema");
const User = require("../models/userSchema");
const Product = require("../models/productSchema");
const category = require("../models/categorySchema");
const Wishlist = require("../models/wishlistSchema");
const {
  validating,
  sendingOtp,
  updateUserProfileItems,
  editPassword,
  gettingOrderDetails,
  fetchOrderDetails,
  orderCancelChangeStatus,
  orderReturnChangeStatus
} = require("../helpers/user-helpers");
const { findCategory } = require("../helpers/product-helpers");
const { categoryWiseFiltering } = require("../helpers/product-helpers");
const bcrypt = require("bcrypt");
const twilio = require("twilio");
const { clearCache } = require("ejs");
const { error } = require("jquery");
const { default: mongoose } = require("mongoose");
const Address = require("../models/addressSchema");
const Coupon = require("../models/couponSchema");

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
          sendingOtp(phone).then(() => {
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
      console.log("seteee");
      res.render("user/login");
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

      if (passwordMatch) {
        req.session.user = user;
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

      validating(phone, otpcode)
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
            res.render("user/confirm-password", { u: false, user });
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
  passwordValidationForConfirm: async (req, res) => {
    try {
      const { phone } = req.query;
      const { newpassword, confirmpassword } = req.body;
      if (newpassword === confirmpassword) {
        console.log(phone);

        const user = await User.findOne({ phone: phone });
        console.log("haihaihaighiagihgahgi", user);

        const hashedpassword = await bcrypt.hash(newpassword, 10);
        console.log(hashedpassword);
        user.password = hashedpassword;

        await user.save();
        // Redirect with a success message
        req.flash("success", "password changed succesfully");
        res.redirect("/login");
      } else {
        const mismatchPassword = "entered passwords do not  match";

        res.render("user/confirm-password", { u: false, mismatchPassword });
      }
    } catch (err) {
      res.render("error", { error: "An error occurred" });
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
  getShopPage: async (req, res) => {
    try {
      const products = await Product.aggregate([
        { $match: { isActive: true } },
      ]);

      if (products) {
        res.render("user/shop", { u: true, products });
      } else {
        res.status(401).json({ message: "products not find" + err });
      }
    } catch {
      res.status(401).json({ message: "products to shop page error" + err });
    }
  },
  sortSearchFilterPagination: async (req, res) => {
    try {
      const {
        selectedSort,
        selectedPriceRange,
        selectedBrand,
        searchQuery,
        selectedPage,
      } = req.query;

      console.log("queryyyyy11", req.query);

      const sortOptions = {};

      if (selectedSort === "price-low-high") {
        sortOptions["SalePrice"] = 1;
      } else if (selectedSort === "price-high-low") {
        sortOptions["SalePrice"] = -1;
      }

      let query = {};

      if (selectedBrand !== "all brands") {
        query["BrandName"] = selectedBrand;
      }

      if (selectedPriceRange !== "All") {
        const [minPrice, maxPrice] = selectedPriceRange.split("-").map(Number);
        query["SalePrice"] = { $gte: minPrice, $lte: maxPrice };
      }

      if (searchQuery) {
        query["ProductName"] = { $regex: new RegExp(searchQuery, "i") };
      }

      console.log("queryyyyyyy", query);
      // Get the total count of matching products for pagination
      const totalCount = await Product.countDocuments(query);

      // Calculate skip and limit for pagination
      const skip = (parseInt(selectedPage) - 1) * 3; // Assuming 10 products per page
      const limit = 3; // Number of products per page

      // Fetch the products based on the query
      const products = await Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      console.log(products);

      // Send the response as JSON with the fetched products and pagination details
      res.json({
        totalProducts: totalCount,
        currentPage: parseInt(selectedPage),
        totalPages: Math.ceil(totalCount / limit),
        products,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Server Error" });
    }
  },

  getProductDetailPage: async (req, res, next) => {
    try {
      const { productId, categoryId } = req.query;

      console.log(req.query);

      const catProd = await Product.aggregate([
        {
          $match: {
            "Category.Slug": categoryId,
          },
        },
      ]);

      const product = await Product.findOne({ Slug: productId });
      console.log("sp" + product);
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
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err });
    }
  },

  getWishlistPage: async (req, res) => {
    try {
      const userId = req.session.user._id;
      let wishlist = await Wishlist.findOne({ UserId: userId })
      let noProducts
      if(!wishlist){
        noProducts=true
        res.render("user/wishlist", { u: true ,noProducts });

      }
   wishlist= await wishlist.populate({
        path: "Products",
        select: "ProductName ProductImages SalePrice Category Slug",
      });
      const products = wishlist.Products;
      res.render("user/wishlist", { products, u: true ,noProducts:false});
    } catch (error) {
 res.render('error',{message:error})
    }
  },
  checkWishlist: async (req, res) => {
    try {
      const { productId } = req.query;
      const userId = req.session.user._id;

      const userWishlist = await Wishlist.findOne({
        UserId: userId,
        Products: productId,
      });

      const isAdded = userWishlist ? true : false;

      res.status(200).json({ isAdded });
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while checking the wishlist." });
    }
  },
  addToWishlist: async (req, res) => {
    try {
      if (req.session.user) {
        const { productId } = req.body;
        const userId = req.session.user._id;

        const userWishlist = await Wishlist.findOne({ UserId: userId });

        // user not have wishlist
        if (!userWishlist) {
          const newWishlist = new Wishlist({
            UserId: userId,
            Products: [productId],
          });
          await newWishlist.save();

          res.status(200).json({ message: "Product added to wishlist." });
        } // user have wishlist
        else {
          if (!userWishlist.Products.includes(productId)) {
            // In userwishlist there the product isn't exist
            userWishlist.Products.push(productId);
            await userWishlist.save();

            res.status(200).json({ message: "Product added to wishlist." });
          } else {
            // product exist in wishlist
            res
              .status(409)
              .json({ error: "Product already exists in wishlist." });
          }
        }
      } else {
        // Display swal alert
        // swal("Not Logged In", "Please log in to add items to your wishlist!", "error");
        res.status(401).json({ error: "Not logged in" });
      }
    } catch {
      {
        res.status(500).json({ error: "some internal server error" });
      }
    }
  },
  removeFromWishlist: async (req, res) => {
    try {
      const { productId } = req.body;
      const userId = req.session.user._id;
      const userWishlist = await Wishlist.findOneAndUpdate(
        { UserId: userId },
        { $pull: { Products: { $in: [productId] } } },
        { new: true }
      );
      console.log(userWishlist);
      if (userWishlist) {
        res
          .status(200)
          .json({ message: "Product removed from wishlist successfully." });
      } else {
        res.status(404).json({ error: "Wishlist not found." });
      }
    } catch (error) {
      res
        .status(500)
        .json({
          error:
            "An error occurred while removing the product from the wishlist.",
        });
    }
  },
  getCheckoutPage: async (req, res) => {
    try {
      const userId = req.session.user._id;
      const addresses = await Address.find({ UserId: req.session.user._id });
      const coupons = await Coupon.find();
      console.log(coupons);

      var cart = await Cart.findOne({ UserId: userId }).populate({
        path: "CartItems.ProductId",
        select: "ProductName ProductImages SalePrice",
      });
      const user = await User.findById(userId);
      cart.populate;
      if (user.DefaultAddress && cart) {
        const addressId = user.DefaultAddress.toString();
        var defaultAddress = await Address.findById(addressId);
        if (addresses.length === 0) {
          console.log(addresses);
          res.render("user/checkout2", { u: true, cart, coupons });
        } else {
          console.log("sreee");
          res.render("user/checkout2", {
            u: true,
            addresses,
            defaultAddress,
            cart,
            coupons,
          });
        }
      } else {
        if (addresses.length === 0) {
          console.log(addresses);
          res.render("user/checkout2", { u: true, cart, coupons });
        } else {
          console.log("sreee");
          res.render("user/checkout2", { u: true, addresses, cart, coupons });
        }
      }

      if (addresses.length === 0) {
        console.log(addresses);
        res.render("user/checkout2", { u: true });
      } else {
        console.log("sreee");
        res.render("user/checkout2", { u: true, addresses, defaultAddress });
      }
    } catch (error) {
      console.log(error);
    }
  },
  addingAddress: async (req, res) => {
    console.log(req.body);
    const {
      Full_Name,
      Email,
      Mobile,
      Flat,
      Area,
      Landmark,
      Pincode,
      Town,
    } = req.body;

    try {
      if (req.session.user) {
        const userId = req.session.user._id;
        console.log(userId);
        const address = await Address.findOne({ UserId: userId });
        if (!address) {
          const newAddress = await new Address({
            UserId: userId,
            FullName: Full_Name,
            Email: Email,
            Phone: Mobile,
            Flat: Flat,
            Area: Area,
            Landmark: Landmark,
            Pincode: Pincode,
            Town: Town,
          });
          await newAddress.save();
          res.status(200).json({ message: "Address added succesfully" });
        } else {
          const newAddress = await new Address({
            UserId: userId,
            FullName: Full_Name,
            Email: Email,
            Phone: Mobile,
            Flat: Flat,
            Area: Area,
            Landmark: Landmark,
            Pincode: Pincode,
            Town: Town,
          });

          await newAddress.save();
          res.status(200).json({ message: "Address added succesfully" });
        }
      } else {
        res.status(401).json({ message: "Please login" });
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  selectDefaultAddress: async (req, res) => {
    try {
      const { addressId } = req.body;
      if (req.session.user) {
        const userId = req.session.user._id;

        const user = await User.findById(userId);
        console.log(user);

        if (user) {
          const selectedAddress = await Address.findById(addressId);
          console.log(selectedAddress);
          if (!user.DefaultAddress) {
            console.log("not coming");

            user.DefaultAddress = selectedAddress;
            await user.save();
            res.status(200).json({ message: "selected address Successfully" });
          } else {
            user.DefaultAddress = selectedAddress;
            await user.save();
            res.status(200).json({ message: "selected address Successfully" });
          }
        } else {
          return res.status(404).json({ error: error });
        }
      } else {
        return res.status(404).json({ error: error });
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  gettingUserProfilePage: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.render('error_login', { u: true });
      }
  
      const userId = req.session.user._id;
  
      const [user, addresses, cart, orders] = await Promise.all([
        User.findById(userId),
        Address.find({ UserId: userId }),
        Cart.findOne({ UserId: userId }),
        gettingOrderDetails(req.session.user._id).catch(err => {
          console.error(err);
          return null;
        })
      ]);
  
      let defaultAddress = null;
  
      if (user.DefaultAddress && cart) {
        const addressId = user.DefaultAddress.toString();
        defaultAddress = await Address.findById(addressId);
      }
  
      res.render("user/user-profile", {
        u: true,
        cart,
        defaultAddress,
        addresses,
        user,
        orders: orders || null
      });
    } catch (error) {
      console.error(error);
      // Handle the error appropriately, e.g., show an error page
      res.render('error', { message:error });
    }
  }
  ,
  updateUserProfileItems: async (req, res) => {
    try {
      console.log(req.body);
      if (req.session.user) {
        updateUserProfileItems(req.body, req.session.user._id).then(
          (response) => {
            // Send a success response to the client
            // res.status(200).send({ success: true });
            res.redirect("/user_profile");
          }
        );
      } else {
        // res.render("error", { u: true, message: "PLEASE LOGIN BUDDY" });
        res.render('error_login',{u:true})
      }
    } catch (err) {
      res
        .status(500)
        .send({ success: false, message: "Error updating profile" });
    }
  },
  update_new_password: async(req, res) => {
    try {

      if(req.session.user){
        editPassword(req.body,req.session.user._id).then((response)=>{
          res.status(200).json({message:response})
        }).catch((err)=>{
          res.status(403).json({passErr:err})
        })

      }
    } catch (err) {
    res.render('error',{u:true,message:err,code:500})
    }
  },
  getOrderDetaiPage:async(req,res)=>{
    try{
      if(req.session.user){
      const {orderId} = req.query
      const userId = req.session.user._id

     const orders = await fetchOrderDetails(orderId,userId)

     res.render('user/order-details',{u:true,orders})
      }else{
        res.render('error_login',{u:true})
      }
    }catch(err){
      res.render('error',{message:error})

    }
  },
  cancelOrder:async(req,res)=>{
    try {
      
      if(req.session.user){

        console.log('hai');
        const{productId,reasonText,OrderId} = req.body
        console.log(req.body);

        orderCancelChangeStatus(productId,reasonText,req.session.user._id,OrderId).then((success)=>{
        
          res.status(200).json({success:true,message:success})
          
        }).catch((err)=>{
          console.log(err);
      res.status(500).json({success:false,message:err})
        })
      }else{
        res.render('error_login',{u:true})

      }
      
    } catch (error) {
      console.log(error);

      res.status(500).json({success:false,message:error})
      
    }
  },
  returnOrder:async(req,res)=>{
    try {

      console.log(req.body);
      const{productId,reasonText,OrderId} =req.body


      orderReturnChangeStatus(productId,reasonText,OrderId,req.session.user._id).then((success)=>{
        res.status(200).json({success:true,message:success})

      }).catch((err)=>{
        console.log(err);
        res.status(500).json({success:false,message:err})

      })
      
    } catch (error) {
      res.status(500).json({success:false,message:error})

    }
  }

  
};
