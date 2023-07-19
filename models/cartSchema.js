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
            SubTotal:{
                type:Number,
                required:true,
                default:0
            },
                FinalTotal:{
                    type:Number,
                    default:0
            } ,
            CouponUsed:[
               { type:String}
            ],
            SelecedCoupon:{
                type:String
            }
           
    },{
        versionKey: false,
      }
    );

    const Cart = mongoose.model('Cart',cartSchema) 
    

    module.exports=Cart