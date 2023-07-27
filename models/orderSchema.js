const mongoose = require('mongoose')
const moment = require('moment')


const  orderSchema = mongoose.Schema({

    OrderId:{
        type:String
      ,
        unique:true,
        default:()=>{
            const timestamp = Date.now().toString()
            const random = Math.floor(Math.random()*1000).toString().padStart(3,'O');
            return `${timestamp}-${random}`;
        }
    },
    CustomerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
      
    },
    Products:[{
        ProductId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product',
            
        },
        ProductName:{
            type:String,
            ref:'Prouct'

        },
        Quantity:{
            type:Number,
          
        },
        Price:{
            type:Number,
          
        },
        Status:{    
            type:String,
            enum:['Pending','Placed','Shipped','Delivered','Cancelled', 'Returned'],
            default:'Pending'
        },
        reasonForCancellation: {
            type: String,
          },
          reasonForReturn:{
            type:String
          }
    }],

    TotalAmount:{
        type:Number,
      
    },
    PaymentMethod:{
        type:String,
        enum:['Cash on Delivery','Razor pay','Paypal'],
    },
  
    createdAt: {
        type: Date,
        default: Date.now(),
        get: function (value) {
          return moment(value).format('YYYY-MM-DD');
        }
      },
    ShippingAddress:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
   

})

const Order = mongoose.model('Order',orderSchema)

module.exports =Order;