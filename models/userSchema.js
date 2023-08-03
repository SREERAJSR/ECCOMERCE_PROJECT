const mongoose = require('mongoose');
const moment = require('moment');

const userSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
  },
  createdDate: {
    type: Date,
    default: Date.now,
    get: function (value) {
      return moment(value).format('YYYY-MM-DD');
    },
  },
  DefaultAddress:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Address'
  },
  Wallet:[{
    amount:{
    type:Number,
    default:0
    },
    transcation:{
      type:String,
      enum:['credited','debited']
    },
    timestamp: {
      type: Date,
      default: Date.now,
      get: function (value) {
        return moment(value).format('YYYY-MM-DD HH:mm:ss');
      }
    }
  }],
  WalletTotalAmount:{
    type:Number,
    default:0
  }
}, {
  versionKey: false,
});

module.exports = mongoose.model('User', userSchema);

