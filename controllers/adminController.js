const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const Product = require("../model/productModel");
const Order = require('../model/orderModel')
const Category = require('../model/catergoryModel')


//to render login page
exports.adminLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

//to render dashboard
exports.dashboard = async (req, res) => {
  try {
    res.render("dashboard", { admin: req.session.admin });
  } catch (error) {
    console.log(error.message);
  }
};

//verifying the admin
exports.verifyAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminData = await User.findOne({ email: email });
    console.log(adminData);
    if (adminData) {
      const passMatch = await bcrypt.compare(password, adminData.password);
      if (passMatch && adminData.is_admin == 1) {
        req.session.admin = adminData.username;
        res.redirect("/admin/dashboard");
      } else {
        res.redirect("/admin");
      }
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//destroying the session
exports.logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

//rendering the user details
exports.user = async (req, res) => {
  try {
    const data = await User.find({ is_admin: 0 });
    res.render("users", { admin: req.session.admin, data });
  } catch (error) {
    console.log(error.message);
  }
};

//blocking user
exports.blockUser = async (req, res) => {
  try {
    const userId = req.query.id;
   
    await User.findByIdAndUpdate(userId, { blocked: true });
    const user = await User.findById({_id : userId});
   
    res.redirect("/admin/users");
  } catch (error) {
    console.log(error.message);
  }
};

//unblock user
exports.unblockUser = async (req, res) => {
  try {
    const userId = req.query.id;
    await User.findByIdAndUpdate(userId, { blocked: false });
    res.redirect("/admin/users");
  } catch (error) {
    console.message(error.message);
  }
};

//edit user
exports.editUser = async (req, res) => {
  try {
    let pId = req.query.id;
    let pinfo = await Product.findById({ _id: pId }).populate({
      path: "category",
      select: "name",
    });
    const category = await Category.find();
    res.render("editproduct", { pinfo, admin: req.session.admin,category});
    // console.log(pinfo);
  } catch (error) {
    console.log(error.message);
  }
};

exports.orderManagement = async (req, res) =>{
  try {
    const orderData = await Order.find()
    res.render('order',{orderData,admin : req.session.admin})
  } catch (error) {
    console.log(error.message);
  }
}

exports.orderDetails = async(req, res) => {

  try {

    const id = req.query.id;
    const orderDetails = await Order.findOne({_id : id}).populate('products.productId',);
  
    // const deliveryDetails = JSON.parse(orderDetails.deliveryDetails);


    res.render('orderdetails',{orderDetails});
  } catch (error) {
    console.log(error.message);
  }
}

exports.deliver = async(req, res) =>{
  try {
    const statusId = req.query.statusid;
    const status = await Order.findById({_id: statusId})
    if (status.status === "placed") {
      const deliverUpdate = await Order.findByIdAndUpdate({_id: statusId},{$set :
        {
         status : "shipped"
        }
       
       })
           res.redirect('/admin/ordermanagement')
      
    }else if(status.status === "shipped"){
      console.log("Rer ");
      const deliverUpdate = await Order.findByIdAndUpdate({_id: statusId},{$set :
        {
         status : "out for delivery"
        }
       
       })
       res.redirect('/admin/ordermanagement')
       
      
    }else if(status.status = "delivered"){
      const deliverUpdate = await Order.findByIdAndUpdate({_id: statusId},{$set :
        {
         status : "delivered"
        }
       
       })
       res.redirect('/admin/ordermanagement')
    }
 

  } catch (error) {
    console.log(error.message);
  }
}


exports.cancelOrder = async(req, res) =>{
  try {
    const cancelId = req.query.cancelid;
    console.log(cancelId);

   const cancelOrder = await  Order.updateOne({_id : cancelId},{
    $set :{
      status : "cancelled"
    }
  
   })
res.redirect('/admin/ordermanagement')


 
  } catch (error) {
    console.log(error.message);
  }
}