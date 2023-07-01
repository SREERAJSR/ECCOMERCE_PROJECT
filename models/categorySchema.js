const mongoose = require('mongoose')


const categorySchema = new mongoose.Schema({

    CategoryName:{
        type:String,
        required:true,
        unique:true
    },
    CategoryImage:{
        type:String
    },
    isActive:{
        type:Boolean
    }
   
})

const category = mongoose.model('category',categorySchema)

module.exports = category