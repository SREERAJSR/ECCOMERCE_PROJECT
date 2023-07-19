    const mongoose = require('mongoose')


    const adminSchema = new mongoose.Schema({

        Username:{
            type:String,
            required:true,
            unique:true
        },
        Password:{
            type:String||Number,
            required:true
        }
    },{
  versionKey: false,
})

    const Admin =  mongoose.model('admin',adminSchema)

    module.exports= Admin