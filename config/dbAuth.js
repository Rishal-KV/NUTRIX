const mongoose = require('mongoose')
exports.dataBaseConnect = () =>{
    mongoose.connect(process.env.db_URL)
}