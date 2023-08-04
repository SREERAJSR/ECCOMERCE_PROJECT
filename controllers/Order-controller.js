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
const {applyCouponToCart,calculateFinalTotal,
  placingOrderInDb, generateRazorPay,
  verifiyingPayment,
  changeOrderStatus,
  deleteCartProducts} = require('../helpers/order-helpers')
const usedCoupon = require('../models/usedCoupons')

module.exports={

  addToCart: async (req, res) => {
    try {
      const { productId, qty } = req.body;
      const quantity = Number(qty);
      const userId = req.session.user._id;
  
      if (req.session.user) {
        // Find the user's existing cart or create a new one
        const cart = await Cart.findOne({ UserId: userId }) || new Cart({ UserId: userId });
  
        // Check if the product is already in the cart
        const existingProduct = cart.CartItems.find(item => item.ProductId.toString() === productId);
  
        // Fetch the product details
        const product = await Product.findById(productId);
        const price = Number(product.SalePrice);
        const stockQuantity = product.StockQuantity;
  
        if (existingProduct) {
          // If the product exists, update the quantity and total
          const updatedQuantity = existingProduct.Quantity + quantity;
          if (updatedQuantity > stockQuantity) {
            return res.status(400).json({ message: 'Out of stock', error: 'The quantity requested exceeds the available stock.' });
          }
          existingProduct.Quantity = updatedQuantity;
          existingProduct.Total = updatedQuantity * price;
        } else {
          // If the product doesn't exist, add it to the cart
          if (quantity > stockQuantity) {
            return res.status(400).json({ message: 'Out of stock', error: 'The quantity requested exceeds the available stock.' });
          }
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
        cart.FinalTotal = totalAmount + 50;
  
        // Decrease the stock quantity of the product
        product.StockQuantity -= quantity;
        await product.save();
  
        // Save the updated cart
        await cart.save();
  
        res.status(200).json({ message: 'Cart updated successfully', cart });
      } else {
        res.status(401).json({ message: 'User authentication failed' });
      }
    } catch (error) {
      // Send an error response back to the AJAX request
      res.status(500).json({ message: 'Error updating cart', error });
    }
  }
  
  ,
    getShoppingCart:async(req,res)=>{
  
      try{
  
        const userId = req.session.user._id
  
       let cart = await Cart.findOne({UserId:userId})
   
        if(!cart){
          console.log(cart);
          console.log('hia');
          res.render('user/shopping-cart', { u:true ,cart,userCheck:true   })
        }
     
       cart = await cart.populate({
          path:'CartItems.ProductId',
          select:'ProductName ProductImages SalePrice ' 
        })
        console.log(cart);
        res.render('user/shopping-cart', { u:true ,cart ,userCheck:true })
      }catch(error){ 
        res.status(500).render('error', { message:error  });
      }
      },
          updateQuantity:async(req,res)=>{
            console.log(req.body,'fffff');

            const{quantityId,status,ProductId}= req.body
            const quantity = Number(req.body.quantity)
            
            
            try {
            
            // Find the cart item by its _id
          const cart = await Cart.findOne({ 'CartItems._id': quantityId });
        
            // Get the cart item from the CartItems array
            const cartItem = cart.CartItems.find((item) => item._id.toString() === quantityId);
           var product = await Product.findById(ProductId)
            console.log(product,'hhh');
            if (cartItem && product) {
              // Increment or decrement the quantity based on the status

              if (status === '+') {
                cartItem.Quantity += 1
                product.StockQuantity -= 1

             

              } else if (status === '-') {
                cartItem.Quantity -= 1
                product.StockQuantity += 1 
              }
              // Ensure the quantity does not go below zero
            if (cartItem.Quantity < 0) {
              cartItem.Quantity = 0;
            }
            //COUPON APPPLIED LOOKING DB
            if(product.StockQuantity< 0){
              return res.status(400).json({ error: 'Out of stock', message: 'The quantity requested exceeds the available stock.' });

                }
            await product.save()

            
      // Recalculate the total pri
      const price = Number(product.SalePrice)
      console.log(price);
            cartItem.Total = cartItem.Quantity * price;
            // Update the TotalAmount field by summing up the individual totals
            const totalAmount = cart.CartItems.reduce((sum, item) => sum + item.Total, 0);
            cart.SubTotal= totalAmount;

        cart.FinalTotal = totalAmount +50 


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
       try {
    const { cartId ,ProductId} = req.body;
    
    const product = await Product.findById(ProductId)
if(!product){
  return res.status(404).json({ error: 'product not found.' });

}
    // Find the cart by its _id
    const userId = req.session.user._id;
    const cart = await Cart.findOne({ UserId: userId });
    

    if (!cart ) {
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

    product.StockQuantity += Number(deletedCartItem.Quantity)

    // Update the TotalAmount by subtracting the deleted item's total
    cart.SubTotal -= deletedItemTotal;

    // Check if any coupons are used by the user
    // const usedCoupons = await usedCoupon.findOne({ UserId: userId });
    // if (usedCoupons && usedCoupons.Coupons.length > 0) {
    //   // Filter out the deleted coupon from the used coupons
    //   usedCoupons.Coupons = usedCoupons.Coupons.filter((coupon) => coupon !== deletedCartItem.CouponCode);
    //   await usedCoupons.save();
    // }

    // Update the FinalTotal by subtracting the deleted item's total
    cart.FinalTotal -= (deletedItemTotal);
    cart.FinalTotal -=50

    // Save the updated cart document
    await product.save()
    await cart.save();

    // Send a success response back to the client
    res.status(200).json({ message: 'Cart item deleted successfully.' });
  } catch (error) {
    // Handle any errors that occur during the deletion process
    res.status(500).json({ error: 'An error occurred while deleting the cart item.' });
  }
}
,
applyCoupon :async (req, res) => {
  try {
    const { coupon } = req.body;
    const userId = req.session.user._id;

    const dbCoupon = await Coupon.findOne({ CouponCode: coupon });
    

    if (!dbCoupon) {
      return res.status(404).json({ error: 'Coupon not found in database' });
    }
    

    const user = await User.findById(userId);
    const cart = await Cart.findOne({ UserId: userId });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found for this user' });
    }

    if (user.UsedCoupon.includes(coupon)) {
      return res.status(409).json({ error: 'Coupon already used' });
    }

    try {


      const updatedCart = await applyCouponToCart(coupon, cart, dbCoupon);
      const finalTotal = calculateFinalTotal(updatedCart);

      console.log(updatedCart,finalTotal);
      user.UsedCoupon.push(coupon);

      await user.save();

      return res.status(200).json({ message: 'Coupon applied successfully', cart: updatedCart, finalTotal });
    } catch (error) {
      if (error === 'Minimum amount not reached' || error === 'Coupon already used') {
        return res.status(400).json({ error: error });
      } else {
        return res.status(500).json({ error: 'Some internal error' });
      }
    }
  } catch (error) {
    return res.status(500).json({ error: 'Some internal error' });
  }
}
,
  placingOrder:async(req,res)=>{

try{
  const {addressId,paymentMethod,TotalPrice,coupon} = req.body
  const userId = req.session.user._id
  placingOrderInDb(addressId,paymentMethod,TotalPrice,userId,coupon).then((dbOrder)=>{

    if(paymentMethod ==="Cash on Delivery"){
      deleteCartProducts(req.session.user._id).then((response)=>{
console.log(response);
        res.status(200).json({message:'Cod Order Sucess'})   
      })

    }
    else if(paymentMethod ==="Wallet"){
      deleteCartProducts(req.session.user._id).then((response)=>{
console.log(response);
        res.status(200).json({message:'Wallet Order Sucess'})   
      })

    }else{
      generateRazorPay(dbOrder.OrderId,dbOrder.TotalAmount).then((razorPayOrder)=>{
      
        res.status(201).json({message:'order created',razorPayOrder})
      })

    }


  }).catch((err)=>{

    res.status(400).json({message:err})


  }) 
}catch(err){
  console.log(err);

}
  
  },
  verifyPayment:(req,res)=>{
    
    verifiyingPayment(req.body).then(()=>{
      changeOrderStatus(req.body['order[receipt]'],req.session.user._id).then(()=>{
        console.log('payment success');
        deleteCartProducts(req.session.user._id).then((response)=>{
          console.log(response);
          res.json({status:true})
        })
      }).catch((err)=>{
        console.log(err);
        res.json({status:false,errorMessage:'Paymemt failed'})
      })
    })
  }
     
  };
  

