const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
  
    name : {
        type : String,
        required : true,
    },
    category : {
   type : mongoose.Schema.Types.ObjectId,
   ref : 'category'
    
    },
    price : {
        type : Number,
        required : true
    },
    stock : {
        type : Number,
        required : true
    },
    description :{
        type : String,
        required : true
    },
    image :{
        image1 :{
            type : String,
            required : true
        },
        image2 :{
            type : String,
            required : true
        },
        image3 : {
            type : String,
            required : true
        },
        image4 : {
            type : String,
            required : true
        }
        
    },
    is_blocked : {
        type : Boolean,
        default : false
    }
},{strictPopulate : false})
const Product = mongoose.model("Product",ProductSchema);

module.exports = Product