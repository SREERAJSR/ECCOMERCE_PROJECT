const mongoose = require('mongoose');


const addressSchema = new mongoose.Schema({

    FirstName:{
        type:String,
        required:true
        
    },
    LastName:{
        type:String,
        required:true
    },
    Country:{
        type:String,
        required:true
    },
    Address:{
        type:String,
        required:true
    },
    City:{
        type:{
            type:String,
            required:true
        }
    },
    State:{
        type:String,
        required:true

    },
    PostCode:{
        type:Number,
        required:true
    },
    Phone:{
        type:Number,
        required:true
    },
    Email:{
        type:String,
        required:true

    }    
})

const Address = mongoose.model('Address',addressSchema)

