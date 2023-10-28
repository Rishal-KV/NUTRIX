const adminController = require("../controllers/adminController");
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')
const couponController = require('../controllers/couponController')
const bannerController = require('../controllers/bannerController')
const express = require("express");
const adminRoute = express();
const adminAuth = require("../middleware/adminAuth");
const multer = require('../middleware/multer')
adminRoute.set("view engine", "ejs"); // Set the view engine
adminRoute.set("views", "./views/admin"); 
adminRoute.use(express.json());
adminRoute.use(express.urlencoded({ extended: true }));


//==========================admin Auth===========================
adminRoute.get("/", adminAuth.isLoggedOut, adminController.adminLogin);
adminRoute.get("/dashboard", adminAuth.isLoggedIn, adminController.dashboard);
adminRoute.post("/admin_verify", adminController.verifyAdmin);
adminRoute.get("/logout", adminController.logout);

//============================user management=======================
adminRoute.get('/users',adminAuth.isLoggedIn,adminController.user);
adminRoute.get('/block',adminController.blockUser);
adminRoute.get('/unblock',adminController.unblockUser);

//===============================product management==================
adminRoute.get('/productmanagement',adminAuth.isLoggedIn,productController.productmanagement);
adminRoute.get('/addproduct',adminAuth.isLoggedIn,productController.showAddProduct)
adminRoute.post('/addproduct',multer.upload.fields([{name : "image1", maxCount : 1},
{name : "image2", maxCount : 1},
{name : "image3", maxCount : 1},
 {name : "image4", maxCount : 1}
]),productController.addProduct);
adminRoute.get('/editproduct',adminController.editUser);
adminRoute.post('/updateproduct',multer.upload.fields([{name : "image1", maxCount : 1},
 {name : "image2", maxCount : 1},
 {name : "image3", maxCount : 1},
 {name : "image4", maxCount : 1}

]),productController.updateProduct);
adminRoute.get('/deleteproduct',productController.deleteProduct)



//================================category management======================
adminRoute.get('/categorymanagement',adminAuth.isLoggedIn,categoryController.categorymanagement)
adminRoute.post('/addcategory',categoryController.addcategory);
adminRoute.get('/editcategory',categoryController.editCategory);
adminRoute.post('/updatecategory',categoryController.updateCategory)
adminRoute.get("/blockcategory",categoryController.blockCategory);
adminRoute.get('/unblockcategory',categoryController.unblockCategory)

//================================order management==========================
adminRoute.get('/ordermanagement',adminController.orderManagement)
adminRoute.get('/viewdetails',adminController.orderDetails)
adminRoute.get('/updatestatus',adminController.deliver)
adminRoute.get('/cancel',adminController.cancelOrder)



//=================================coupon management=========================
adminRoute.get('/couponmanagement', adminAuth.isLoggedIn, couponController.coupon)
adminRoute.get('/addcoupon',adminAuth.isLoggedIn,couponController.addCoupon)
adminRoute.post('/addcoupon',couponController.addcouponPost)
adminRoute.get('/editcoupon',couponController.editcoupon)
adminRoute.post("/updatecoupon",couponController.updateCoupon)
adminRoute.get('/updatecouponstatus',couponController.action);



//==================================sales report================================
adminRoute.get('/salesreport',adminAuth.isLoggedIn,adminController.salesReport)
adminRoute.get('/sort',adminController.Sorting)
adminRoute.get('/download',adminController.downloadReport)


//==================================banner mgt==================================
adminRoute.get('/bannermanagement',adminAuth.isLoggedIn, bannerController.banner)
adminRoute.get('/addbanner',bannerController.addBanner)
module.exports = adminRoute;
