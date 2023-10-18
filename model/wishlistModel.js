const mongoose = require('mongoose');

const wishListSchema = new mongoose.Schema({
    user : {
        type : String,
        required : true,
        ref : 'User'
    },
    products : [{
     productId : {
        type : String,
        required : true,
        ref : 'Product'
     }   
}
    ]
})

module.exports= new mongoose.model('Wishlist',wishListSchema)