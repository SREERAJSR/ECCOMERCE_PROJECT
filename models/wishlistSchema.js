const mongoose = require('mongoose')


const wishlistSchema = new mongoose.Schema({

    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    Products:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    }    
    ]
})

const Wishlist = mongoose.model('Wishlist',wishlistSchema); 
module.exports= Wishlist
