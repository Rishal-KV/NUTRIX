const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    product: {
        type: String,
        ref: 'Product'
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
    like: {
        type : Boolean,
        default: true
    },
    useFull: [
        {
            user: {
                ref: 'User',
                type: String
            }
        }
    ],

    notUseFull: [
        {
            user: {
                ref: 'User',
                type: String
            }
        }
    ]


})

module.exports = new mongoose.model('review', reviewSchema) 