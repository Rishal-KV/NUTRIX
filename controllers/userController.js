const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Product = require("../model/productModel");
const Cart = require("../model/cartModel");

require("dotenv").config();



let randomNumber = 0; // Variable to store a random number
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
    const { name, email, password } = req.body;
    const verified = await User.find({ email });
    console.log(verified);
    emailOne = email;
    // Generate a random 4-digit OTP
    randomNumber = Math.floor(Math.random() * 900000) + 100000;
    setTimeout(() => {
      randomNumber = null;
    }, 120000); // 2 minutes (120,000 milliseconds)
    
    if (verified.is_verified === true) {
      req.app.locals.specialContext = "Email already exists";
      return res.redirect("/register");
    } else {
      const spassword = await securePassword(password);
      const newUser = new User({
        username: name,
        email: email,
        password: spassword,
        is_admin: 0,
      });
      const userData = await newUser.save();

      // req.app.locals.specialContext = "Sign up successful! Please login";
      res.render("otp");

      // Send an email with the OTP
      const mailOptions = {
        from: process.env.GMAIL, // Your email address
        to: emailOne, // User's email address
        subject: "Your OTP for Sign-Up",
        html: ` <h1>Your OTP is: ${randomNumber}</h1>`,
      };
      transporter.sendMail(mailOptions);
    }
  } catch (error) {
    console.log(error.message);
  }
};

// exports.getResendOtp = 

// Render the home page
exports.home = async (req, res) => {
  try {
    const items = await Product.find();
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
   
 
    res.render("home", { user: req.session.user, items, count  });
  } catch (error) {
    console.log(error.message);
  }
};

// Verify login credentials
exports.verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passMatch = await bcrypt.compare(password, userData.password);
      if (passMatch && userData.is_admin == 0 && userData.blocked == false) {
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
    const { a,b,c,d,e,f } = req.body;

    const otp = parseInt(`${a}${b}${c}${d}${e}${f}`, 10);
    const user = await User.findOne({ email: emailOne });
    if (randomNumber == otp) {
      const verified = await User.updateOne(
        { email: emailOne },
        { $set: { is_verified: true } }
      );

      if (verified) {
        req.session.otp = otp;
        req.session.user = user.username;

        // req.app.locals.specialContext = "Sign up successful! Please login";
        res.redirect("/home");
      } else {
        res.redirect("/confirm_otp");
      }
    } else {
      res.redirect("/confirm_otp");
    }
  } catch (error) {
    console.log(error.message);
  }
};

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

    const cart = await Cart.findOne({userId : req.session.userId})
    let count = 0
    if(req.session.user){
      if(cart?.products?.length > 0){
        count = count + cart.products.length
      }else{
        count = 0
      }
    }
   
    res.render("product", { pdata,user: req.session.user ,count});
  } catch (error) {
    console.log(error.message);
  }
};

exports.shop = async (req, res) => {
  try {
    const product = await Product.find();
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