const mongoose = require('mongoose');
const moment = require('moment');
const addressSchema = require('./addressSchema')

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
  address:[addressSchema]

}, {
  versionKey: false,
});

module.exports = mongoose.model('User', userSchema);
