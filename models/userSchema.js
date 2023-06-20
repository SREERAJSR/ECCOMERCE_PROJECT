const mongoose = require('mongoose')

const userSchema  = new mongoose.Schema({
    

    Name:{
        type:String,
        required:true,
    },
    phone:{
        type:Number,
        require:true,
        unique:true
    },
    Email:{
        type:String,
        required:true,
        unique:true,

    },
    password:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
        
    },
    createdDate:{
        type:Date, 
        default:Date.now
    }

},{
    versionKey:false
})

module.exports = mongoose.model('User',userSchema)