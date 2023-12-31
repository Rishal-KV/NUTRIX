const express = require("express");
const userRoute = express();
const userController = require("../controllers/userController");
const userAuth = require("../middleware/userAuth");
const cartController = require('../controllers/cartController')
const addressController = require('../controllers/addressController')
const orderController = require('../controllers/orderController')
const wishListController = require('../controllers/wishListController')
const couponController = require('../controllers/couponController')
const reviewController = require('../controllers/reviewController')


userRoute.set("view engine", "ejs"); // Set the view engine
userRoute.set("views", "./views/user"); // Specify the views directory
userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }));


//============================user auth=======================
userRoute.get("/", userAuth.isLoggedOut, userController.home);
userRoute.get("/login", userAuth.isLoggedOut, userController.signIn);
userRoute.get('/register' ,userAuth.isLoggedOut,userController.signup);
userRoute.post("/user_registration", userController.register);
userRoute.post("/login", userController.verifyLogin);
userRoute.post("/confirm", userController.otpConfirm);
userRoute.post('/resend',userController.resendOtp)
userRoute.get("/signout", userController.signout);


userRoute.get('/forgotpassword',userController.forgotPassword)
userRoute.post('/resetpassword',userController.resetPassword)
userRoute.post('/confirm_otp',userController.checkOtp)
userRoute.get('/change_password',userAuth.otpConfirm,userController.changePasswordPage)
userRoute.post('/confirm_password',userController.confirmPassword)


//===========================product==========================
userRoute.get("/home", userAuth.isLoggedIn,userController.home);
userRoute.get("/productdetails", userController.productDetails);
userRoute.get("/shop", userController.shop);


//===============================cart===========================
userRoute.get('/getcart',userAuth.isLoggedIn,cartController.getCart);
userRoute.post('/addtoCart',cartController.addToCart);
userRoute.post('/cartmodify',cartController.updateCart);
userRoute.post('/removecart',cartController.removeCart)


//==============================user profile=====================
userRoute.post('/editprofile',userAuth.isLoggedIn,userController.editprofile);
userRoute.post('/changepassword',userController.changePassword);
userRoute.get('/profile',userAuth.isLoggedIn,addressController.profile);
userRoute.get('/checkout',userAuth.isLoggedIn,cartController.checkout )
userRoute.get('/addaddress', userAuth.isLoggedIn,addressController.address)
userRoute.post('/addaddress',addressController.toAddAddress)
userRoute.post('/selectedAddress',addressController.selectedAddress)
userRoute.get('/editaddress', userAuth.isLoggedIn,addressController.geteditaddress);
userRoute.post('/editaddress',addressController.editaddress)
userRoute.post('/addaddresscheckout',addressController.toAddAddressCheckout)


//================================wishlist===========================
userRoute.get('/wishlist',userAuth.isLoggedIn,wishListController.Wishlist)
userRoute.post('/addToWishlist',wishListController.addToWishList)
userRoute.post('/removewishlist',wishListController.removeWishlist)



//================================order===============================
userRoute.post('/placeorder',orderController.orderPlace)
userRoute.post('/verifypayment',orderController.verifypayment)
userRoute.get('/ordersuccess',userAuth.isLoggedIn,orderController.success);
userRoute.get('/remove',userAuth.isLoggedIn,addressController.remove);
userRoute.post('/cancelorder',orderController.cancelOrder)
userRoute.get('/orderdetails',userAuth.isLoggedIn,orderController.orderDetails);


//==============================coupon==================================
userRoute.post('/applycoupon',couponController.applyCoupon);
userRoute.get('/remove_coupon',couponController.removecoupon);

//===============================Review=================================
userRoute.post('/addreview',reviewController.addReview)


module.exports = userRoute;
