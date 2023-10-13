        const express = require("express");
        const userRoute = express();
        const userController = require("../controllers/userController");
        const userAuth = require("../middleware/userAuth");
        const cartController = require('../controllers/cartController')
        const addressController = require('../controllers/addressController')
        const orderController = require('../controllers/orderController')

        userRoute.set("view engine", "ejs"); // Set the view engine
        userRoute.set("views", "./views/user"); // Specify the views directory
        userRoute.use(express.json());
        userRoute.use(express.urlencoded({ extended: true }));

        userRoute.get("/", userAuth.isLoggedOut, userController.home);
        userRoute.get("/login", userAuth.isLoggedOut, userController.signIn);
        userRoute.get('/register',userController.signup);
        userRoute.post("/user_registration", userController.register);
        userRoute.get("/home", userAuth.isLoggedIn,userController.home);
        userRoute.post("/login", userController.verifyLogin);
        userRoute.post("/confirm", userController.otpConfirm);
        userRoute.post('/resend',userController.resendOtp)
        userRoute.get("/signout", userController.signout);
        userRoute.get("/productdetails", userController.productDetails);
        userRoute.get("/shop", userController.shop);
        userRoute.post('/changepassword',userController.changePassword);


        userRoute.get('/getcart',userAuth.isLoggedIn,cartController.getCart);
        userRoute.post('/addtoCart',cartController.addToCart);
        userRoute.post('/cartmodify',cartController.updateCart);
        userRoute.post('/removecart',cartController.removeCart)



        userRoute.get('/profile',userAuth.isLoggedIn,addressController.profile);
        userRoute.get('/checkout',userAuth.isLoggedIn,cartController.checkout )
        userRoute.get('/addaddress', userAuth.isLoggedIn,addressController.address)
        userRoute.post('/addaddress',addressController.toAddAddress)

        userRoute.post('/selectedAddress',addressController.selectedAddress)
        userRoute.get('/editaddress', userAuth.isLoggedIn,addressController.geteditaddress);
        userRoute.post('/editaddress',addressController.editaddress)
        userRoute.post('/placeorder',orderController.orderPlace)
        userRoute.get('/remove',addressController.remove);
        userRoute.post('/cancelorder',orderController.cancelOrder)
        userRoute.get('/orderdetails',orderController.orderDetails);

        module.exports = userRoute;
