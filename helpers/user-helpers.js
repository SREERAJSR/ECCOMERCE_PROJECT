const User = require("../models/userSchema");
const twilio = require("twilio");
const Cart = require('../models/cartSchema')
const Product = require("../models/productSchema");
const category = require("../models/categorySchema");
const Wishlist = require('../models/wishlistSchema')
const { findCategory } = require("../helpers/product-helpers");
const { categoryWiseFiltering } = require("../helpers/product-helpers");
const bcrypt = require("bcrypt");;
const Address = require('../models/addressSchema')
const Coupon = require("../models/couponSchema")



module.exports = {


  sendingOtp: async(phone) => {
    // return new Promise(async (resolve, reject) => {
      try {
        // Set up the Twilio client with your Account SID and Auth Token
        const accountSid = process.env.accountSid;
        const authToken = process.env.authToken;
        const client = twilio(accountSid, authToken);
        await client.verify.v2
          .services(process.env.verifySid)
          .verifications.create({ to: "+91" + phone, channel: "sms" });
        //resolve();
      } catch (err) {
      //   reject(err);
       }
     //});
  },
   validating:  (phone, otpcode) => {
    console.log('ahaaahaha'+phone);
    return new Promise(async (resolve, reject) => {
      const client =  twilio(process.env.accountSid, process.env.authToken);
      await client.verify.v2
        .services(process.env.verifySid)
        .verificationChecks.create({ to: "+" + phone, code: otpcode })
        .then((verification_check) => {
          console.log(verification_check.status);
          resolve(verification_check.status); 
        })
        .catch((err) => {
           console.log('hai there!!!!!!');
          reject(err);
        });
    });
  },

  findUser:(phone)=>{
    return new Promise(async(resolve,reject)=>{

      try{
  
     let user=await User.findOne({phone})

      console.log(user);
 
      }catch(err){
        console.log(err);
      }
    })


  },
  updateUserProfileItems:(userInfo,userId)=>{
    return new Promise(async(resolve,reject)=>{

      try{
        console.log('haiiiiiii');
        const {fullName,email,phone } =userInfo
        const user = await User.findByIdAndUpdate(userId,{
          Name:fullName,
          Email:email,
          phone:phone
        },{new:true})
       await user.save().then((savedInfo)=>{
        console.log(savedInfo);

        resolve(savedInfo)
       })

      }catch(err){

        console.log(err);

        reject(err)

      }
    })

  },
  editPassword:(formData,userId)=>{

    return new Promise(async(resolve,reject)=>{
      try{

     const  {current_password,new_password,same_password} = formData

     if(new_password!==same_password){
 
      return reject('new Password and rentered password are not same')
     }
     const user = await  User.findById(userId)
 
     const hashedPassword = user.password
     const passwordMatch = await bcrypt.compare(current_password,hashedPassword)

     if(!passwordMatch){
        return reject('Current password is incorrect')
     }
      // If the current_password matches the hashed password, you can now proceed to update the password with the new_password
      const hashedNewPassword = await bcrypt.hash(new_password, 10);

           // Update the user's password in the database
           await User.findByIdAndUpdate(userId, { password: hashedNewPassword });
 // Resolve with a success message
 resolve('Password updated successfully');
      }catch(err){

        reject(err)
      }
    })

  }
};
