const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Product = require("../model/productModel");
const Cart = require("../model/cartModel");
const Wishlist = require('../model/wishlistModel');

require("dotenv").config();



let otp = 0; // Variable to store a random number
let emailOne;
const smtpConfig = {
  service: "Gmail", // Your email service provider
  auth: {
    user: process.env.GMAIL,
    pass: process.env.PASSWORD, /// Your email address
    // pass: , // Your email password
  },
};

// Function to securely hash a password using bcrypt
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const transporter = nodemailer.createTransport(smtpConfig);

// Generate a random OTP


exports.signup = async (req, res) =>{
  try {
    res.render('signup')
  } catch (error) {
      console.log(error.message);
  }
}
// Sign-in page rendering
exports.signIn = async (req, res) => {
  try {
    var passError =  req.app.locals.passError
    req.app.locals.passError = " "

    res.render("login", {user : req.session.user,passError});
  } catch (error) {
    console.log(error.message);
  }
};



// Registration page rendering
exports.register = async (req, res) => {
  try {
    
    // Generate a random 4-digit OTP
    otp = Math.floor(Math.random() * 90000) + 10000;

     req.session.username = req.body.name;
     req.session.email = req.body.email;
     req.session.password = req.body.password;
     email = req.body.email
     const userFound = await User.findOne({email : email});
console.log(otp);
     if (userFound) {
         res.redirect('/login')
     }else{
           // Send an email with the OTP
           const mailOptions = {
            from: process.env.GMAIL, // Your email address
            to: req.session.email, // User's email address
            subject: "Your OTP for Sign-Up",
            html: ` <h1>Your OTP is: ${otp}</h1>`,
          };
          transporter.sendMail(mailOptions);

               res.render("otp");
     }
  } catch (error) {
    console.log(error.message);
  }
};


// Render the home page
exports.home = async (req, res) => {
  try {
    const userId = req.session.userId
    const items = await Product.find({is_blocked : false});
    const carts = await Cart.findOne({ userId: req.session.userId }); //
    let count = 0;
    if(req.session.user){
      if(carts){
        count = count + carts.products.length;
      }else{
        count = 0
      }
     
    }else{
       count = 0
    }
    let wishListStrin = []
    const wishlist = await Wishlist.findOne({user: userId })
      wishlist?.products.map((ele)=>{
      wishListStrin.push(ele.productId)
      })
      console.log(wishListStrin);

 
      
 res.render("home", { user: req.session.user, items, count,wishListStrin  });
  } catch (error) {
    console.log(error.message);
  }
};

// Verify login credentials
exports.verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
console.log("he");
    const userData = await User.findOne({ email: email });

    if (userData) {
      const passMatch = await bcrypt.compare(password, userData.password);
      if (passMatch && userData.blocked == false) {
        req.session.userId = userData._id;
        req.session.user = userData.username;
        return res.redirect("/home");
      } else {
        req.app.locals.passError = "Incorrect password. Please try again.";
        return res.redirect("/login");
      }
    } else {
      req.app.locals.ErrorContext = "Invalid email address. Please try again.";
      return res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Confirm OTP and redirect to home page if correct, or back to OTP confirmation page if incorrect
exports.otpConfirm = async (req, res) => {
  try {
    const {first, second, third, fourth,fifth} = req.body;

    const  userOtp = parseInt(`${first}${second}${third}${fourth}${fifth}`, 10);
    console.log(userOtp + "  "  + otp);

       if(userOtp === otp){

        req.session.password = await bcrypt.hash(req.session.password,10);
        const newUser = new User({
          username : req.session.username ,
          email : req.session.email,
          password : req.session.password
        })
        newUser.save()

        res.json({success : true})
      
       

       }else{
        res.json({success : false})
          res.render('otp',)
       }


  } catch (error) {
    console.log(error.message);
  }
};

exports.resendOtp = async(req, res) =>{
  try {
    otp = Math.floor(Math.random() * 90000) + 10000;
    const mailOptions = {
      from: process.env.GMAIL, // Your email address
      to: req.session.email, // User's email address
      subject: "Your OTP for Sign-Up",
      html: ` <h1>Your OTP is: ${otp}</h1>`,
    };
    transporter.sendMail(mailOptions);
    res.render('otp',{msg : 'otp has been sent'})
  } catch (error) {
    console.log(error.message);
  }
}

exports.signout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

exports.productDetails = async (req, res) => {
  try {
    const id = req.query.id;
    const pdata = await Product.findById({ _id: id });
    const  similar = await Product.find({category : pdata.category}).populate('category');

    const cart = await Cart.findOne({userId : req.session.userId})
    let count = 0
    if(req.session.user){
      if(cart?.products?.length > 0){
        count = count + cart.products.length
      }else{
        count = 0
      }
    }
   
    res.render("product", { pdata,user: req.session.user ,count,similar});
  } catch (error) {
    console.log(error.message);
  }
};

exports.shop = async (req, res) => {
  try {
    const product = await Product.find({});
    res.render("shop", { product, user: req.session.user });
  } catch (error) {
    console.log(error.message);
  }
};


exports.changePassword = async (req, res) =>{
  try {
    const userId = req.session.userId
    const user = await User.findOne({_id : userId});
    const  oldPassword = user.password;

    const  {currentpassword, newpassword} = req.body;
    const passwordMatch = await bcrypt.compare(currentpassword, oldPassword);
    if(passwordMatch){
      const newpass = await bcrypt.hash(newpassword,10)
      user.password = newpass
      console.log("changed");
      const updatedPassword = await user.save(); 
      res.redirect('/profile')
    }else{
      console.log("password doesnt match");
      res.redirect('/profile')
    }
  } catch (error) {
    console.log(error.message);
  }
}