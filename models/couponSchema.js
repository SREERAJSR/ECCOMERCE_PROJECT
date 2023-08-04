const mongoose = require('mongoose');
const moment = require('moment');

const couponSchema = new mongoose.Schema({
  CouponCode: {
    type: String,
    required: true,
  },
  DiscountPercentage: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value >= 0 && value <= 100; // Validate that discount is between 0 and 100
      },
      message: 'Discount must be between 0 and 100',
    },
  },
  MinAmount: {
    type: Number,
    required: true,
  },
  MaxAmount: {
    type: Number,
    required: true,
  },
  ValidFromDate: {
    type: Date,
    required: true,
    get: function (value) {
      return moment(value).format('YYYY-MM-DD');
    },
  },
  ValidTillDate: {
    type: Date,
    required: true,
    get: function (value) {
      return moment(value).format('YYYY-MM-DD');
    },
  },
});

// Virtual getter to calculate the discount amount based on percentage
couponSchema.virtual('DiscountAmount').get(function () {
  return (this.DiscountPercentage / 100) * this.MinAmount;
});

// Virtual getter to check if the coupon has expired
couponSchema.virtual('IsExpired').get(function () {
  return moment().isAfter(this.ValidTillDate, 'day');
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
