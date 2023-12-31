const mongoose = require('mongoose');
const offerSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
  
    discountAmount: {
      type: Number,
    },
  
    activationDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    category :{
      type : String,
  
    },
    
    is_blocked: {
      type: Boolean,
      default: false,
    },
  });
  
  module.exports = mongoose.model('Offer',offerSchema)
