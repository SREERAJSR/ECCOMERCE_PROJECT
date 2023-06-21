const mongoose = require('mongoose')


const productSchema = new mongoose.Schema({

    ProductName:{

        type:String,
        required:true
    },
    BrandName:{

        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    ScreenSize:{
        type:String,
        required:true
    },
    RamMemory:{
        type:String,
        required:true
    },
    Category:{
        categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
        },
        categoryName:{
            type:String,
            required:true
        }
    },
    StockQuantity:{ 
        type:Number,
        required:true
    },
    RegularPrice:{
        type:Number,
        required:true
    },
    SalePrice:{
        type:Number,
        required:true
    },
    ProductImages:[{
        type:String,
        required:true
    }]
    
})

const Product = mongoose.model('Product',productSchema)

module.exports=Product