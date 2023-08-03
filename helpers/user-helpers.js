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
const Wallet = require('../models/walletSchema')
const Coupon = require("../models/couponSchema")
const Order = require('../models/orderSchema')
const mongoose = require('mongoose')
const moment = require('moment')

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
      //   reject(err) ;
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
 
  },
          gettingOrderDetails:async(userId)=>{
            return new Promise(async(resolve,reject)=>{
              try{
                
                console.log(userId);
                const orders = await Order.aggregate([{
                  $match:{CustomerId:mongoose.Types.ObjectId.createFromHexString(userId)}
              },{
                $project: {
                  _id: 0, // Exclude the default _id field from the result
                  ProductName: '$Products.ProductName', // Get the product name
                Quantity: '$Products.Quantity',
                Price:'$TotalAmount',
                Status:'$Products.Status',
                Date:'$createdAt',
                OrderId:'$OrderId',
                PaymentMethod:'$PaymentMethod',
                SalePrice:'$Products.Price'

                } // Get the quantity
              }])
              orders.forEach((order) => {
                order.Date = moment(order.Date).format('YYYY-MM-DD');
              });
              // Sort the orders array in descending order based on the Date field
      orders.sort((a, b) => new Date(b.Date) - new Date(a.Date));
              
     if(orders.length===0){
      
      reject('no orderss')
     }
      resolve(orders)

     
      }catch(err){
        console.log(err);

        reject(err)

      }
    })
      
  },
  fetchOrderDetails:(orderId,userId)=>{

    return new Promise(async(resolve,reject)=>{
      try {

        const orders =await Order.aggregate([{
          $match:{
            CustomerId:mongoose.Types.ObjectId.createFromHexString(userId),
            OrderId:orderId
          }
        },{
          $unwind:'$Products'
        },{
          $lookup:{
            from:'products',
            localField:'Products.ProductId',
            foreignField:'_id',
            as:'ProductInfo'
          }
        },{
          $unwind:'$ProductInfo'

        },{
          $project:{
            _id:null,
            ProductName:'$Products.ProductName',
            Quantity:'$Products.Quantity',
            Price:{$multiply:['$Products.Quantity','$Products.Price']},
            Status:'$Products.Status',
            ProductImages:'$ProductInfo.ProductImages',
            PaymentMethod:'$PaymentMethod',
            Date:'$createdAt',
            OrderId:'$OrderId',
            TotalAmount:'$TotalAmount',
            ProductId:'$ProductInfo._id'         
          }
        }
     ])
     orders.forEach((order) => {
      order.Date = moment(order.Date).format('YYYY-MM-DD');
    });
   
    console.log(orders);
    if(!orders){
      reject('no orders')

    }
    resolve(orders)
        

        
      } catch (error) {

        console.log(error);
        reject(error)
        
      }
    })
  },
  orderCancelChangeStatus:(productId,reasonText,userId,OrderId)=>{
    return new Promise(async(resolve, reject) => {
      
      try {

        const user = await User.findById(userId)

        
      const order = await Order.findOne({CustomerId:userId,
      OrderId:OrderId})
        
      if(!order){
        reject('No orders found for the user.');
        return;
      }
     
      let found = false;
      const targetProductId = mongoose.Types.ObjectId.createFromHexString(productId);
let Price;
      order.Products.forEach((item) => {
        if (item.ProductId.equals(targetProductId)) {
          item.Status = 'Cancel request';
          item.reasonForCancellation=reasonText;
          found = true;
           Price= item.Price
        }
      });
      if(!found){
        reject('Product not found in the order.');
        return;
      }

      // if(order.PaymentMethod==='Razor pay'){
      //   const wallet = await Wallet.findOne({ User: userId });

      //   if(!wallet){

      //  const  newWallet = new Wallet({
      //       User:userId,
      //       Balance:Number(Price),
      //     })
      //     user.Wallet =Number(Price)

      //    await  newWallet.save()
      //   }else{
      //     console.log('order.Price:', Price);
      //     wallet.Balance += Number(Price);
      //     console.log('wallet.Balance:', wallet.Balance);
      //     await wallet.save()
      //     user.Wallet = wallet.Balance
      //   }
      // }
      // await user.save()
      await order.save();
      resolve('Order status updated successfully.');
      } 
      catch (error) {
console.log(error);
        reject(error)
        
      }
    })
  },
  orderReturnChangeStatus:(productId,reasonText,OrderId,userId)=>{

    return new Promise(async(resolve, reject) => {
      
      try {

        const order = await Order.findOne({CustomerId:userId,
        OrderId:OrderId})
          
        if(!order){
          reject('No orders found for the user.');
          return;
        }
       
        let found = false;
        const targetProductId = mongoose.Types.ObjectId.createFromHexString(productId);
  
        order.Products.forEach((item) => {
          if (item.ProductId.equals(targetProductId)) {
            if(item.Status==='Delivered'){
              item.Status = 'Return request';
              item.reasonForReturn=reasonText;
              found = true;

            }else{
              reject('product is not delivered')
            }
          }
        });
        if(!found){
          reject('Product not found in the order.');
          return;
        }
  
        await order.save();
        resolve('Order status updated successfully.');
        } 
        catch (error) {
  console.log(error);
          reject(error)
          
        }
    })
  }

};
