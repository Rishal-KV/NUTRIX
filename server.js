require('dotenv').config();

const database = require('./config/dbAuth')
database.dataBaseConnect()

const express = require('express');
const app = express();
const session = require('express-session')
const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute')
const path = require('path');
const crypto = require('crypto');
const nocache = require('nocache');
const { dataBaseConnect } = require('./config/dbAuth');

app.use(express.static(path.join(__dirname, "public")));
const secretKey = crypto.randomBytes(32).toString('hex')

app.use(session({
  secret:  secretKey , 
  resave: false,
  saveUninitialized: true
}));
app.use(nocache())


app.use('/', userRoute);
app.use('/admin', adminRoute);
app.use((req, res)=>{
  res.status(404).render(__dirname + '/views/user/error.ejs')
})
app.listen(3000, ()=>{
    console.log('server is running');
})

module.exports = {app}