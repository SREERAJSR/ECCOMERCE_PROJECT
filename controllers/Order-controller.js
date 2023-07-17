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
const Cart = require('../models/cartSchema')
const Coupon = require('../models/couponSchema')
const {couponApplying,addingCouponToCart,
  placingOrderInDb, generateRazorPay} = require('../helpers/order-helpers')
const usedCoupon = require('../models/usedCoupons')

module.exports={

    addToCart:async(req,res)=>{

        try{
         
          const {productId,qty} = req.body
          const quantity = Number(qty)
          const userId = req.session.user._id
  
          if(req.session.user){      
  
           // Find the user's existing cart or create a new one
      const cart = await Cart.findOne({ UserId: userId }) || new Cart({ UserId: userId });
  
          //check  if the product is already exist
  
          const existingProduct =  cart.CartItems.find(item=> item.ProductId.toString()===productId)
          
          if (existingProduct) {
            // If the product exists, update the quantity and total
            existingProduct.Quantity += quantity;
            const product = await Product.findById(existingProduct.ProductId);
            const price = Number(product.SalePrice);
            existingProduct.Total = existingProduct.Quantity * price;
          } else {
            // If the product doesn't exist, add it to the cart
            const product = await Product.findById(productId);
            const price = Number(product.SalePrice);
            const total = quantity * price;
            cart.CartItems.push({ ProductId: productId, Quantity: quantity, Total: total });
          }
    
          // Calculate the total amount based on the updated cart items
          let totalAmount = 0;
          for (const item of cart.CartItems) {
            totalAmount += item.Total;
          }
    
          // Update the total amount in the cart
          cart.SubTotal = totalAmount;
          // Check if any coupons are used by the user
      const UsedCoupons = await usedCoupon.findOne({ UserId: req.session.user._id });

      if (UsedCoupons && UsedCoupons.Coupons.length > 0) {
        // Iterate over the used coupons and calculate the discount amount
        let discountAmount = 0;
        for (const couponCode of UsedCoupons.Coupons) {
          const coupon = await Coupon.findOne({ CouponCode: couponCode });
          if (coupon) {
            const couponDiscount = (coupon.Discount / 100) * totalAmount;
            discountAmount += couponDiscount;
          }
        }

        // Subtract the discount amount from the FinalTotal
        cart.FinalTotal = totalAmount - discountAmount;
      } else {
        // If no coupons are used, set the FinalTotal same as the SubTotal
        cart.FinalTotal = totalAmount;
      }

        
          // Save the updated cart
          await cart.save();
    
  
       res.status(200).json({ message: 'Cart updated successfully', cart });
    }else{
      res.status(401).json({ message: 'User authentication failed' });
  
    }
        }catch(error){
           // Send an error response back to the AJAX request
      res.status(500).json({ message: 'Error updating cart', error });
  
      }
    },
    getShoppingCart:async(req,res)=>{
  
      try{
  
        const userId = req.session.user._id
  
        const cart = await Cart.findOne({UserId:userId}).populate({
          path:'CartItems.ProductId',
          select:'ProductName ProductImages SalePrice ' 
        })
        console.log(cart);

        const coupons =  await Coupon.find()
        res.render('user/shopping-cart', { u:true ,cart ,coupons })
      }catch{ 
      }
      },
          updateQuantity:async(req,res)=>{
            console.log(req.body);
            const{quantityId,status}= req.body
            const quantity = Number(req.body.quantity)
            
            try {
            
            // Find the cart item by its _id
          const cart = await Cart.findOne({ 'CartItems._id': quantityId });
        
            // Get the cart item from the CartItems array
            const cartItem = cart.CartItems.find((item) => item._id.toString() === quantityId);
            if (cartItem) {
              // Increment or decrement the quantity based on the status
              if (status === '+') {
                cartItem.Quantity += 1
              } else if (status === '-') {
                cartItem.Quantity -= 1
              }
              // Ensure the quantity does not go below zero
            if (cartItem.Quantity < 0) {
              cartItem.Quantity = 0;
            }
            //COUPON APPPLIED LOOKING DB


            
      // Recalculate the total price
      const product =  await Product.findById(cartItem.ProductId)
      const price = Number(product.SalePrice)
      console.log(price);
            cartItem.Total = cartItem.Quantity * price;
            // Update the TotalAmount field by summing up the individual totals
            const totalAmount = cart.CartItems.reduce((sum, item) => sum + item.Total, 0);
            cart.SubTotal= totalAmount;
// Check if any coupons are used by the user
const UsedCoupons = await usedCoupon.findOne({ UserId: req.session.user._id });

if (UsedCoupons && UsedCoupons.Coupons.length > 0) {
  // Iterate over the used coupons and calculate the discount amount
  let discountAmount = 0;
  for (const couponCode of UsedCoupons.Coupons) {
    const coupon = await Coupon.findOne({ CouponCode: couponCode });
    if (coupon) {
      const couponDiscount = (coupon.Discount / 100) * totalAmount;
      discountAmount += couponDiscount;
    }
  }

  // Subtract the discount amount from the FinalTotal
  cart.FinalTotal = (totalAmount - discountAmount)+50;
} else {
  // If no coupons are used, set the FinalTotal same as the SubTotal
  cart.FinalTotal = totalAmount+50;
}

            await cart.save(); 

            // Send a success response back to the client
            res.status(200).json({ message: 'Quantity updated successfully.',updatedPrice: cartItem.Total, quantityId: quantityId,updateSubTotalAmount:cart.SubTotal , updateTotalAmount:cart.FinalTotal });
          } else {
            // Send an error response if the cart item is not found
            res.status(404).json({ error: 'Cart item not found.' });
          }
        } catch (error) {
          // Handle any errors that occur during the update process
          res.status(500).json({ error: 'An error occurred while updating the quantity.' });
        }
          }  ,
     deleteCartItem: async (req, res) => {
  const { cartId } = req.body;
  try {
    // Find the cart by its _id
    const userId = req.session.user._id;
    const cart = await Cart.findOne({ UserId: userId });
    console.log(cart);

    if (!cart) {
      // If the cart is not found, send an error response
      return res.status(404).json({ error: 'Cart not found.' });
    }

    // Find the index of the cart item to be deleted
    const itemIndex = cart.CartItems.findIndex((item) => item._id.toString() === cartId);
    if (itemIndex === -1) {
      // If the item is not found, send an error response
      return res.status(404).json({ error: 'Cart item not found.' });
    }

    // Get the deleted cart item and its total price
    const deletedCartItem = cart.CartItems[itemIndex];
    const deletedItemTotal = deletedCartItem.Total;

    // Remove the item from the CartItems array
    cart.CartItems.splice(itemIndex, 1);

    // Update the TotalAmount by subtracting the deleted item's total
    cart.SubTotal -= deletedItemTotal;

    // Check if any coupons are used by the user
    const usedCoupons = await UsedCoupon.findOne({ UserId: userId });
    if (usedCoupons && usedCoupons.Coupons.length > 0) {
      // Filter out the deleted coupon from the used coupons
      usedCoupons.Coupons = usedCoupons.Coupons.filter((coupon) => coupon !== deletedCartItem.CouponCode);
      await usedCoupons.save();
    }

    // Update the FinalTotal by subtracting the deleted item's total
    cart.FinalTotal -= deletedItemTotal;

    // Save the updated cart document
    await cart.save();

    // Send a success response back to the client
    res.status(200).json({ message: 'Cart item deleted successfully.' });
  } catch (error) {
    // Handle any errors that occur during the deletion process
    res.status(500).json({ error: 'An error occurred while deleting the cart item.' });
  }
}
,

    applyCoupon:async(req,res)=>{
    
      try{
        const{coupon} = req.body

        
        const DbCoupon= await Coupon.findOne({CouponCode : coupon})      
        if(!DbCoupon){
          res.status(404).json({error:'coupon not found in database'})
        }else{
          const userId = req.session.user._id
          couponApplying(userId,DbCoupon).then((resp)=>{
            addingCouponToCart(coupon,userId).then((response)=>{
         
        
              res.status(200).json({message:'coupon applied succesfully',response,resp})
            }).catch((err)=>{
              res.status(409).json({message:err})
            })         
          }).catch((err)=>{
            console.log(err);
            res.status(400).json({message :err})
          })
        }
    }catch(error){
      res.status(500).json({error:'Some internal Error'})
    }
  },
  placingOrder:async(req,res)=>{

try{
  const {addressId,paymentMethod,TotalPrice} = req.body
  const userId = req.session.user._id
  placingOrderInDb(addressId,paymentMethod,TotalPrice,userId).then((dbOrder)=>{

    if(paymentMethod ==="Cash on Delivery"){
      res.status(200).json({message:'Order Sucess'})   
    }else{
      generateRazorPay(dbOrder.OrderId,dbOrder.TotalAmount).then((razorPayOrder)=>{
        res.status(201).json({message:'order created',razorPayOrder})
      })

    }


  }) 
}catch(err){
  console.log(err);

}
  
  },
  verifyPayment:(req,res)=>{
    console.log(req.body);
  }
     
  };
  

