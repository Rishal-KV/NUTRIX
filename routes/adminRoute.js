const adminController = require("../controllers/adminController");
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')
const express = require("express");
const adminRoute = express();
const adminAuth = require("../middleware/adminAuth");
const multer = require('../middleware/multer')
adminRoute.set("view engine", "ejs"); // Set the view engine
adminRoute.set("views", "./views/admin"); 
adminRoute.use(express.json());
adminRoute.use(express.urlencoded({ extended: true }));

adminRoute.get("/", adminAuth.isLoggedOut, adminController.adminLogin);
adminRoute.get("/dashboard", adminAuth.isLoggedIn, adminController.dashboard);
adminRoute.post("/admin_verify", adminController.verifyAdmin);
adminRoute.get("/logout", adminController.logout);
adminRoute.get('/users',adminController.user);
adminRoute.get('/block',adminController.blockUser);
adminRoute.get('/unblock',adminController.unblockUser);
adminRoute.get('/productmanagement',productController.productmanagement);
adminRoute.get('/addproduct',productController.showAddProduct)
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
adminRoute.get('/categorymanagement',categoryController.categorymanagement)
adminRoute.post('/addcategory',categoryController.addcategory);
adminRoute.get('/editcategory',categoryController.editCategory);
adminRoute.post('/updatecategory',categoryController.updateCategory)
adminRoute.get("/blockcategory",categoryController.blockCategory);
adminRoute.get('/unblockcategory',categoryController.unblockCategory)
adminRoute.get('/ordermanagement',adminController.orderManagement)
adminRoute.get('/viewdetails',adminController.orderDetails)
adminRoute.get('/admin/deliver',adminController.deliver)
module.exports = adminRoute;
