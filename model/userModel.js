const mongoose = require("mongoose");

// Define the User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true
    
  },
  password: {
    type: String,
    required: true,
  },
  is_verified :{
     type :Boolean,
     default : false
  },
  is_admin :{
     type : Number
  },
  blocked :{
    type  : Boolean,
    default :  false
  },
  wallet :{
    type : Number,
    default : 0,
  },
  walletHistory :[{
    date :{
      type : Date
    },
    amount :{
      type : Number
    },
    status :{
      type : String
    }
  }]
});

// Create the User model
const User = mongoose.model("User", userSchema);

module.exports = User;
