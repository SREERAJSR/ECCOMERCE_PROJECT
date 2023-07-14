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



module.exports={

    couponApplying:(userId,coupon)=>{

        return new Promise (async(resolve,reject)=>{
            

            try{
                const cart = await Cart.findOne({UserId:userId})
                if( cart.SubTotal >= coupon.MinAmount ){
                    const discountAmount = (coupon.Discount / 100) * cart.SubTotal;
                    const finalTotal = Math.abs(cart.FinalTotal - discountAmount).toFixed(0);
                    
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
                      const savedCoupon = await couponAddingToUsedCoupons.save() && cart.save()
                      resolve(savedCoupon);

                }
            
            }
          } catch (error) {
            reject(error);
          }
        });
      }


}
