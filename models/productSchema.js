const mongoose = require('mongoose')


const productSchema = new mongoose.Schema({
    Slug: {
        type: String,
        required: true,
        unique: true,
      },

    ProductName:{

        type:String,

    },
    BrandName:{

        type:String,

    },
    Description:{
        type:String,
        
    },
    ScreenSize:{
        type:String,
       
    },
    MemorySize:{
        type:String,
       

    },
   
    Category:{
        categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'categories', // Reference to the Category model
        },
        categoryName:{
            type:String,
            ref:'categories'
        },
        Slug:{
            type:String,
            ref:'categories',
        }
        
    },
    StockQuantity:{ 
        type:Number,
   
    },
    RegularPrice:{
        type:Number,
      
    },
    SalePrice:{
        type:Number,

    },
    ProductImages:[{
        type:String,

    }],
    isActive:{
        type:Boolean
    }
    
})

const Product = mongoose.model('Product',productSchema)

module.exports=Product