    const mongoose = require('mongoose')


    const walletSchema = new mongoose.Schema({

        User:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            unique:true
        },
        Balance:{
            type:Number,
            default:0
        }
    }) 

    const  Wallet = mongoose.model('Wallet',walletSchema)

    module.exports = Wallet