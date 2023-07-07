const mongoose = require('mongoose')


 const cartSchema = new mongoose.Schema({

        UserId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },

        CartItems:[{
            ProductId:{
                type:mongoose.Types.ObjectId,
                ref:'Product',
                required:true
            },
            Quantity:{
                type:Number,
                required:true,
                default:1
            },
            Total:{
                type:Number
            }
        }
        ],
        TotalAmount:{
            type:Number,
            required:true,
            default:0
        } 
 }, 
 {
    
 });

 const Cart = mongoose.model('Cart',cartSchema) 
 

 module.exports=Cart