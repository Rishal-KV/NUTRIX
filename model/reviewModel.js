const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    product: {
        type: String,
        ref: 'Product'
    },
   
    reviews: [
        {
            review: {
                type: String
            },
            userId : {
                type : String,
                ref : 'User',
              
              },
              rating: {
                type: Number,

            },
        }
    ]
  

})

module.exports = new mongoose.model('review', reviewSchema) 