    const mongoose = require('mongoose');


    const addressSchema = new mongoose.Schema({
        UserId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        FullName:{
            type:String,
            required:true
            
        },
        Email:{
            type:String,
            required:true
        },
        Phone:{
            type:Number,
            required:true
        },
        Flat:{
            type:String,
            required:true
        },
        Area:{
            type:String,
            required:true
        },
        Landmark:{
        
                type:String,
                required:true
            
        },
        Pincode:{
            type:String,
            required:true

        },
        Town:{
            type:String,
            required:true
        }
    },{
        versionKey: false,
      })

  Address  = mongoose.model('Address', addressSchema);
    
    module.exports = Address
    

