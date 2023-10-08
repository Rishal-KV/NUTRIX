const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({

name : {
    type : String,
    required : true
},
Blocked :{
    type : Boolean,
    default : false
}
})
const Category = mongoose.model('category', categorySchema)

module.exports = Category