const User = require("../models/userSchema");
const userHelpers = require("../helpers/user-helpers");
const category = require("../models/categorySchema");
const { clearCache } = require("ejs");
const { findCategory } = require("../helpers/product-helpers");
const Product = require("../models/productSchema");
const { default: mongoose } = require("mongoose");
const Cart = require('../models/cartSchema')
const Coupon = require('../models/couponSchema')
const usedCoupon = require('../models/usedCoupons');
const Order = require('../models/orderSchema')
const Razorpay = require('razorpay');

var instance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

module.exports={

    couponApplying:(userId,coupon)=>{

        return new Promise (async(resolve,reject)=>{
            
            try{
                const cart = await Cart.findOne({UserId:userId})
                if( cart.SubTotal >= coupon.MinAmount && cart.SubTotal<coupon.MaxAmount){
                    const discountAmount = (coupon.Discount / 100) * cart.SubTotal;
                    const finalTotal = Math.abs(Math.floor(cart.SubTotal - discountAmount));
                    cart.FinalTotal = finalTotal;
                        const savedCart=await cart.save()
                            resolve(savedCart)
                }else{
                    
                 reject('mininum amount to reached')
                }
                
            }catch(error){

                reject(error)

            }

        })

    },
    addingCouponToCart: (coupon, UserId) => {
        return new Promise(async (resolve, reject) => {
          try {
       
            
            const couponsUsed = await usedCoupon.findOne({ UserId: UserId });
            const cart = await Cart.findOne({UserId:UserId})
            
            if (couponsUsed && cart) {
              const couponIncluded = couponsUsed.Coupons.includes(coupon);
              const couponExist = cart.CouponUsed.includes(coupon)
              console.log(couponIncluded);
              console.log("couponincart",couponExist);
              
              if (!couponIncluded && !couponExist) {
                couponsUsed.Coupons.push(coupon);
                cart.CouponUsed.push(coupon)
                cart.SelecedCoupon=coupon
                const savedCoupon = await couponsUsed.save() &&  cart.save()
                resolve(savedCoupon);
              } else {
                reject('Coupon already used');
              }
            } else {
                if(cart.CouponUsed.includes(coupon)){
                    reject('Coupon already used')
                }else{
                    const couponAddingToUsedCoupons = new usedCoupon({
                        UserId: UserId,
                        Coupons: [coupon],
                      });
                      cart.CouponUsed.push(coupon)
                      cart.SelecedCoupon=coupon
                      const savedCoupon = await couponAddingToUsedCoupons.save() && cart.save()
                      resolve(savedCoupon);
                }
            }
          } catch (error) {
            reject(error);
          }
        });
      },
      placingOrderInDb:(addressId,paymentMethod,TotalPrice,userId)=>{
       
        return new Promise(async(resolve,reject)=>{
          const cart = await Cart.findOne({UserId:userId}).populate()
         
          if(!cart){
            reject()
          }else{

          const OrderItems= await  cart.populate({
            path:'CartItems.ProductId',
            select:"ProductName SalePrice"
          
           })
          const products=OrderItems.CartItems.map((product)=>{
            
           
            return {
              
              ProductId:product.ProductId._id,
              ProductName:product.ProductId.ProductName,
              Quantity:product.Quantity,
              Price:product.ProductId.SalePrice
              
            }
           })
           const newOrder = await new Order({
            CustomerId:userId,
            TotalAmount:TotalPrice,
            PaymentMethod:paymentMethod,
            Products:products,

      })
      await newOrder.save().then((savedOrder)=>{
        resolve(savedOrder)
      })

    }
        })

      },
      generateRazorPay:(orderId,amount)=>{
        return new Promise((resolve,reject)=>{
          instance.orders.create({
            amount: amount,
            currency: "INR",
            receipt: orderId,
            notes: {
              key1: "value3",
              key2: "value2"
            }
          }).then((order)=>{
            console.log(order);
            resolve(order)
          }).catch((err)=>{
            reject(err)
          })

        })
      }


}
