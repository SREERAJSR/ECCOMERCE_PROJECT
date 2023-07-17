const mongoose = require('mongoose')


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
          
        }
    }],

    TotalAmount:{
        type:Number,
      
    },
    PaymentMethod:{
        type:String,
        enum:['Cash on Delivery','Razor pay','Paypal'],
      

    },
    Status:{
        type:String,
        enum:['Pending','Processing','Shipped','Delivered'],
        default:'Pending'
    },
    createdAt:{
        type:Date,
        default:Date
    }

})

const Order = mongoose.model('Order',orderSchema)

module.exports =Order;