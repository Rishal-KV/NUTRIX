const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    product: {
        type: String,
        ref: 'Product'
    },
    userId : {
      type : String,
      ref : 'User'
    },
    user: {
        type: String
    },
    rating: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            review: {
                type: String
            }
        }
    ],
  

})

module.exports = new mongoose.model('review', reviewSchema) 