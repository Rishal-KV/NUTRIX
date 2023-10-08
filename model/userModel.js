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
  }
});

// Create the User model
const User = mongoose.model("User", userSchema);

module.exports = User;
