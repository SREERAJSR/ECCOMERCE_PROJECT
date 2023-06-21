const mongoose = require('mongoose')


const categorySchema = new mongoose.Schema({

    CategoryName:{
        type:String,
        required:true
    },
    products:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    }]
})