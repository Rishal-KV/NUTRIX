const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Product = require("../model/productModel");
const Cart = require("../model/cartModel");
const Wishlist = require('../model/wishlistModel');
const Banner = require('../model/bannerModel');
const Category = require('../model/catergoryModel');
const Review = require('../model/reviewModel')
const Offer = require('../model/offerModel')



require("dotenv").config();



let otp = 0; // Variable to store a random number
const smtpConfig = {
  service: "Gmail", // Your email service provider
  auth: {
    user: process.env.GMAIL,
    pass: process.env.PASSWORD, /// Your email address
    // pass: , // Your email password
  },
};


const transporter = nodemailer.createTransport(smtpConfig);

// Generate a random OTP


exports.signup = async (req, res) => {
  try {
    var userErr = req.app.locals.userErr
    res.render('signup', { title: "Register", user: req.session.user, userErr })
  } catch (error) {
    console.log(error.message);
  }
}
// Sign-in page rendering
exports.signIn = async (req, res) => {
  try {

  req.session.loginValidation;
console.log(req.session.loginValidation);

    res.render("login", { user: req.session.user, title: "Login",loginval :   req.session.loginValidation },(err,html)=>{
      if(!err){
        req.session.loginValidation = false ;
        res.send(html)
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};



// Registration page rendering
exports.register = async (req, res) => {
  try {
    let otpErr = req.app.locals.otpErr
    // Generate a random 4-digit OTP

    otp = Math.floor(Math.random() * 90000) + 10000;

    req.session.username = req.body.name;
    req.session.email = req.body.email;
    req.session.password = req.body.password;
    email = req.body.email
    const userFound = await User.findOne({ email: email });
    console.log(otp);
    if (userFound) {
      req.app.locals.userErr = "Account already exists"
      res.redirect('/register')
    } else {
      // Send an email with the OTP
      const mailOptions = {
        from: process.env.GMAIL, // Your email address
        to: req.session.email, // User's email address
        subject: "Your OTP for Sign-Up",
        html: ` <h1>Your OTP is: ${otp}</h1>`,
      };
      transporter.sendMail(mailOptions);
      setTimeout(() => {
        otp = Math.floor(Math.random() * 90000) + 10000;
      }, 60000)

      res.render("otp", { title: "Nutrix otp", otpErr });
    }
  } catch (error) {
    console.log(error.message);
  }
};


// Render the home page
exports.home = async (req, res) => {
  try {

   
    const banner = await Banner.find({status : true});
    const userId = req.session.userId
    let search = req.query.search || ""
    const items = await Product.find({
      is_blocked: false,
      name: { $regex: '^' + search, $options: "i" }
    }).limit(4).populate('category');
    for(let i = 0; i < items.length ; i++){
      await items[i].populate('category.offer');
    }
    


    const carts = await Cart?.findOne({ userId }); //
    let count = 0;
    let wishCount = 0
    let wishListStrin = [];

    if (req.session.user) {
      const wishlist = await Wishlist.findOne({ user: req.session.userId });
      wishlist ? wishCount = wishlist.products.length : 0
      wishlist?.products.map((ele) => {
        wishListStrin.push(ele.productId)
      })
      if (carts) {
        count = count + carts.products.length;
      } else {
        count = 0
      }

    } else {
      count = 0
    }

  




    res.render("home", { user: req.session.user, items, count, wishListStrin, title: "NUTRIX", wishCount, banner});
  } catch (error) {
    console.log(error.message);
  }
};

// Verify login credentials
exports.verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email);
    // console.log("he");
    const userData = await User.findOne({ email: email });

    if (userData) {
      const passMatch = await bcrypt.compare(password, userData.password);
      if (passMatch && userData?.blocked == false) {
        req.session.userId = userData._id;
        req.session.user = userData.username;
       
        return res.redirect("/home");
      } else {
        if (userData.blocked) {
          req.session.loginValidation = 1
          return res.redirect("/login");
        }
        req.session.loginValidation = 2
        return res.redirect("/login");
       
      }
    } else {
      req.session.loginValidation = 3
      return res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
};

// Confirm OTP and redirect to home page if correct, or back to OTP confirmation page if incorrect
exports.otpConfirm = async (req, res) => {
  try {

    const { first, second, third, fourth, fifth } = req.body;

    const userOtp = parseInt(`${first}${second}${third}${fourth}${fifth}`, 10);
    console.log(userOtp + "  " + otp);

    if (userOtp === otp) {
      req.session.user = req.session.username
      req.session.password = await bcrypt.hash(req.session.password, 10);
      const newUser = new User({
        username: req.session.username,
        email: req.session.email,
        password: req.session.password,
        is_admin: 0
      })
      await newUser.save()
      let user = await User.findOne({ email: req.session.email })
      req.session.userId = user._id
      res.json({ success: true })


    } else {

      res.json({ success: false })

    }


  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
};

exports.resendOtp = async (req, res) => {
  try {

    otp = Math.floor(Math.random() * 90000) + 10000;
    console.log(otp + " resend otp");
    const mailOptions = {
      from: process.env.GMAIL, // Your email address
      to: req.session.email, // User's email address
      subject: "Your OTP for Sign-Up",
      html: ` <h1>Your OTP is: ${otp}</h1>`,
    };
    transporter.sendMail(mailOptions);
    setTimeout(() => {
      otp = Math.floor(Math.random() * 90000) + 10000;
    }, 60000)
    res.json({ success: true })

  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
}

exports.signout = async (req, res) => {
  try {
    req.session.destroy();
   return res.json({logout : true})
  } catch (error) {
    console.log(error.message);
  }
};

exports.productDetails = async (req, res) => {
  try {
    let wishCount = 0
    let  avgRating = 0;
    let rating
    let discount
    const id = req.query.id;
    const pdata = await Product.findById({ _id: id }).populate('category');
    await pdata.populate('category.offer')
    if(pdata.category.offer && pdata.category.offer.expiryDate > new Date()){
         let percentage  = pdata.price * pdata.category.offer.discountAmount / 100
          discount = pdata.price -  Math.floor(percentage)
    }
    
    
    const wishlist = await Wishlist.findOne({ user: req.session.userId })
    const similar = await Product.find({ category: pdata.category._id })
    console.log(similar);
    const review = await Review.findOne({ product: id }).populate('reviews.userId')
    review ? rating = review?.reviews?.reduce((acc, curr)=> acc + curr.rating,0) : undefined
    
avgRating = rating / review?.reviews?.length
    // console.log(similar);
    // console.log(similar);
    wishlist ? wishCount = wishlist.products.length : 0
    const cart = await Cart.findOne({ userId: req.session.userId })
    let count = 0
    if (req.session.user) {
      if (cart?.products?.length > 0) {
        count = count + cart.products.length
      } else {
        count = 0
      }
    }

    res.render("product", { pdata, user: req.session.user, count, similar, title: "product", wishCount,review,avgRating,discount });
  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
};



exports.shop = async (req, res) => {
  try {
    let wishCount = 0
    let count = 0
    let wishListStrin = [];
    //taking page num thorugh query
    let pageNum = req.query.page  || 1
    
 
    //setting how much product should be display in shop
    let perPage = 3;

    //taking doc Count
    let docCount = await Product.countDocuments();

    let pages = Math.ceil(docCount / perPage);
  
    // let catToFront
    let sort = req.query.id
    const search = req.query.search || "";

    let selectedCategory = req.query.category || ''
   if( !Array.isArray(selectedCategory) && selectedCategory !=''){
    selectedCategory = req.query.category.split(',')

   }
    // console.log(selectedCategory);
    const selectedPriceRanges = req.query.price || '';
    // console.log(selectedPriceRanges);
    const [minPrice, maxPrice] = selectedPriceRanges.split('-');

    const priceRangeQuery = minPrice && maxPrice ? {
      price: { $gte: minPrice, $lte: maxPrice }
    } : {};

    // selectedCategory == '' ? catToFront =  '' : catToFront = selectedCategory

    if (selectedCategory == '') {
      let cat = await Category.find({}, { _id: 1 })
      selectedCategory = cat.map((val) => val._id.toString());
    }
    console.log(selectedCategory);
    // console.log(catToFront);
    const category = await Category.find();
    const wishlist = await Wishlist.findOne({ user: req.session.userId });
    const cart = await Cart.findOne({ userId: req.session.userId });
    wishlist?.products.map((ele) => {
      wishListStrin.push(ele.productId)
    })
    console.log(pageNum-1);
    cart ? count = cart.products.length : 0
    wishlist ? wishCount = wishlist.products.length : 0
    const product = await Product.find({
      is_blocked: false,
      name: { $regex: search, $options: "i" },
      category: { $in: selectedCategory },
      ...priceRangeQuery
    }).sort({ price: sort }).skip((pageNum - 1) * perPage).limit(perPage).populate('category')

   
    for(let i = 0; i < product.length ; i++){
      await product[i].populate('category.offer');
    }
    
   
   
    

    res.render("shop", {
      product,
      user: req.session.user,
      title: "Shop",
      wishCount,
      count,
      category,
       pageNum,
      docCount,
      pages,
      pageNum,
      wishListStrin,
      selectedCategory
    });
  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
};


exports.changePassword = async (req, res) => {
  try {
    const userId = req.session.userId
    const user = await User.findOne({ _id: userId });
    const oldPassword = user.password;

    const { currentpassword, newpassword } = req.body;
    // console.log(currentpassword);
    // console.log(newpassword);
    const passwordMatch = await bcrypt.compare(currentpassword, oldPassword);
    if (passwordMatch) {
      const newpass = await bcrypt.hash(newpassword, 10)
      user.password = newpass

      const updatedPassword = await user.save();
      req.session.changePassword = 1
  res.redirect('/profile')
    } else {
      req.session.changePassword = 2
     res.redirect('/profile')
    }
  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
}



exports.forgotPassword = async (req, res) => {
  try {
    let err = req.app.locals.err;
    req.app.locals.err = ""
    res.render('forgotpassword', { title: "change password", user: "User", wishCount: 0, count: 0,err })
  } catch (error) {
console.log(error.message);
res.render('500')
  }
}

exports.resetPassword = async (req, res) => {
  try {
    req.session.email = req.body.email
     let userFound = await User.findOne({email: req.session.email})
     if (userFound) {
      otp = Math.floor(Math.random() * 90000) + 10000;
      console.log(otp);
      const mailOptions = {
        from: process.env.GMAIL, // Your email address
        to: req.session.email, // User's email address
        subject: "Your OTP for Sign-Up",
        html: ` <h1>Your OTP is: ${otp}</h1>`,
      };
      transporter.sendMail(mailOptions);
      setTimeout(() => {
        otp = Math.floor(Math.random() * 90000) + 10000;
      }, 60000)
      res.render('changeotp',{email : req.session.email})
     }else{
      req.app.locals.err = "no user found!!!"
         res.redirect('/forgotpassword')
     }
  
  } catch (error) {
    console.log(error.message );
    res.render('500')
  }
}

exports.checkOtp = async(req,res) =>{
  try {
    const { first, second, third, fourth, fifth } = req.body;

    const userOtp = parseInt(`${first}${second}${third}${fourth}${fifth}`, 10);
    console.log(userOtp + "  " + otp);
   if(userOtp == otp){
     res.json({confirmotp : true})
   }else{
    res.json({confirmotp : false})
   }
   
  } catch (error) {
   console.log(error.message);
   res.render('500')
  }
}

exports.changePasswordPage = async(req,res) =>{
  try {
    res.render('changepassword',{user : undefined ,title : "change password",count : undefined, wishCount: undefined})
  } catch (error) {
    console.log(error.message);
  }
}

exports.confirmPassword = async(req, res) =>{
  try {

    const {password} = req.body
    console.log(req.session.email);
     const hashedPassword = await bcrypt.hash(password,10)
     const changePassword = await User.findOneAndUpdate({email : req.session.email},
      {$set :{
        password : hashedPassword
      }}
      )
      // console.log(changePassword);
      if(changePassword){
        res.json({resetpassword : true})
       
      }
  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
}


exports.editprofile = async(req, res) =>{
  try {
  let {name, email} = req.body
  let update = await User.updateOne({_id : req.session.userId},
    {$set:{
      username : name,
      email : email
    }}
    )
    console.log(name);
    console.log(update);
    if(update){
      res.json({updated : true})
    }
  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
}
