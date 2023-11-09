const adminController = require("../controllers/adminController");
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')
const couponController = require('../controllers/couponController')
const bannerController = require('../controllers/bannerController')
const offerController = require('../controllers/offerController')
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
adminRoute.get('/block',adminAuth.isLoggedIn,adminController.blockUser);
adminRoute.get('/unblock',adminAuth.isLoggedIn,adminController.unblockUser);

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
adminRoute.get('/editcategory',adminAuth.isLoggedIn,categoryController.editCategory);
adminRoute.post('/updatecategory',categoryController.updateCategory)
adminRoute.get("/blockcategory",adminAuth.isLoggedIn,categoryController.blockCategory);
adminRoute.get('/unblockcategory',adminAuth.isLoggedIn,categoryController.unblockCategory)

//================================order management==========================
adminRoute.get('/ordermanagement',adminAuth.isLoggedIn,adminController.orderManagement)
adminRoute.get('/viewdetails',adminAuth.isLoggedIn,adminController.orderDetails)
adminRoute.get('/updatestatus',adminAuth.isLoggedIn,adminController.deliver)
adminRoute.get('/cancel',adminAuth.isLoggedIn,adminController.cancelOrder)



//=================================coupon management=========================
adminRoute.get('/couponmanagement', adminAuth.isLoggedIn, couponController.coupon)
adminRoute.get('/addcoupon',adminAuth.isLoggedIn,couponController.addCoupon)
adminRoute.post('/addcoupon',couponController.addcouponPost)
adminRoute.get('/editcoupon',adminAuth.isLoggedIn,couponController.editcoupon)
adminRoute.post("/updatecoupon",couponController.updateCoupon)
adminRoute.get('/updatecouponstatus',adminAuth.isLoggedIn,couponController.action);



//==================================sales report================================
adminRoute.get('/salesreport',adminAuth.isLoggedIn,adminController.salesReport)
adminRoute.get('/sort',adminAuth.isLoggedIn,adminController.Sorting)
adminRoute.get('/download',adminAuth.isLoggedIn,adminController.downloadReport)


//==================================banner mgt==================================
adminRoute.get('/bannermanagement',adminAuth.isLoggedIn, bannerController.banner)
adminRoute.get('/addbanner',adminAuth.isLoggedIn,bannerController.addBanner)
adminRoute.post('/addbanner',multer.bannerUpload.single('image'),bannerController.uploadBanner)
adminRoute.get('/banneraction',adminAuth.isLoggedIn,bannerController.action)
adminRoute.get('/editbanner',adminAuth.isLoggedIn,bannerController.editBanner)
adminRoute.post('/updatebanner',multer.bannerUpload.single('image'),bannerController.update)


//==================================offer mgt==================================
adminRoute.get('/offermanagement',adminAuth.isLoggedIn,offerController.offer)
adminRoute.get('/addoffer',adminAuth.isLoggedIn,offerController.addOffer)
adminRoute.post('/addoffer',offerController.offerAdd)
adminRoute.get('/editoffer',adminAuth.isLoggedIn,offerController.editoffer);
adminRoute.post('/editoffer',offerController.updateOffer)
adminRoute.get('/offerstatus',adminAuth.isLoggedIn,offerController.updateStatus)

module.exports = adminRoute;
