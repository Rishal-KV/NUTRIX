const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const Product = require("../model/productModel");
const Order = require('../model/orderModel')
const Category = require('../model/catergoryModel')
const puppeteer = require('puppeteer')
const ejs = require('ejs');
const path = require('path')
const fs = require('fs')
const ExcelJS = require('exceljs');


//to render login page
exports.adminLogin = async (req, res) => {
  try {
    let passErr = req.app.locals.passErr
    req.app.locals.passErr = "" 
    res.render("login",{passErr});
  } catch (error) {
    console.log(error.message);
  }
};

//to render dashboard
exports.dashboard = async (req, res) => {
  try {
    const users = await User.find({ is_admin: 0 });
    const revenue = await Order.aggregate([
      {
        $match: {
          "status": "delivered"
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" }
        }
      }
    ]);

    let sales = await Order.find({ "status": "delivered" });
    let totalSales = sales.length;

    let Payment = await Order.aggregate([
      {
        $match: {
          "status": "delivered"
        }
      },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 }
        }
      }
    ]);

    const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);

    const monthly = await Order.aggregate([
      {
        $match: {
          "status": "delivered"
        }
      },
      {
        $addFields: {
          date: { $toDate: "$date" }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      },
      {
        $group: {
          _id: "$_id.year",
          months: {
            $push: {
              month: "$_id.month",
              count: "$count"
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          months: {
            $setUnion: ["$months", allMonths.map(month => ({ month, count: 0 }))]
          }
        }
      }
    ]);


    let monthlySalesArr = [];
 

    if (monthly.length > 0) {
      let monthlySalesArray = monthly[0];
      if (monthlySalesArray && monthlySalesArray.months) {
        monthlySalesArray.months.map(monthInfo => monthlySalesArr.push(monthInfo.count));
      }
    }
   

    let onlinePaymentCount = 0;
    let cashCount = 0;

    if (Payment.length > 0) {
      const onlinePayment = Payment.find(payment => payment._id === "online payment");
      const cashPayment = Payment.find(payment => payment._id === "COD");
      if (onlinePayment) onlinePaymentCount = onlinePayment.count || 0;
      if (cashPayment) cashCount = cashPayment.count || 0;
    }

    let Total = 0;

    if (revenue.length > 0) {
      Total = revenue[0]?.totalAmount || 0;
    }

    res.render("dashboard", { admin: req.session.admin, Total, totalSales, onlinePaymentCount, cashCount, users, monthlySalesArr,title : "dashboard" });
  } catch (error) {
    console.log(error.message);
  }
};


//verifying the admin
exports.verifyAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminData = await User.findOne({ email: email });
    // console.log(adminData);
    if (adminData) {
      const passMatch = await bcrypt.compare(password, adminData.password);
      if (passMatch && adminData.is_admin == 1) {
        req.session.admin = adminData.username;
        res.redirect("/admin/dashboard");
      } else {
        req.app.locals.passErr = "incorrect password"
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
    console.log(data);
    res.render("users", { admin: req.session.admin, data,title : "User details" });
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
    res.render("editproduct", { pinfo, admin: req.session.admin,category,title : "User details"});
    // console.log(pinfo);
  } catch (error) {
    console.log(error.message);
  }
};

exports.orderManagement = async (req, res) =>{
  try {
    const orderData = await Order.find().sort({date : -1})
    res.render('order',{orderData,admin : req.session.admin,title : "Order management"})
  } catch (error) {
    console.log(error.message);
  }
}

exports.orderDetails = async(req, res) => {

  try {

    const id = req.query.id;
    const orderDetails = await Order.findOne({_id : id}).populate('products.productId',).sort({date: -1});
  
    // const deliveryDetails = JSON.parse(orderDetails.deliveryDetails);


    res.render('orderdetails',{orderDetails,title : "Order management"});
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
      // console.log("Rer ");
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
    // console.log(cancelId);

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

exports.salesReport = async(req, res) =>{


    try {
      const orderData = await Order.aggregate([
        { $unwind: "$products" },
        { $match: { status: "delivered" } },
        { $sort: { date: -1 } },
        {
          $lookup: {
            from: "products",
            let: { productId: { $toObjectId: "$products.productId" } },
            pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }],
            as: "products.productDetails",
          },
        },
        {
          $addFields: {
            "products.productDetails": {
              $arrayElemAt: ["$products.productDetails", 0],
            },
          },
        },
      ]);
      // console.log(orderData);
   res.render('salesreport',{orderData,title : "Sales report"});
  }catch(error){
console.log(error.message);
  }
}

exports.Sorting = async (req, res) => {
  try {
    const duration = parseInt(req.query.id);
    const currentDate = new Date();
    const startDate = new Date(currentDate - duration * 24 * 60 * 60 * 1000);

    const orderData = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $match: {
          status: "delivered",
          date: { $gte: startDate, $lt: currentDate },
        },
      },
      {
        $sort: { date: -1 },
      },
      {
        $lookup: {
          from: "products",
          let: { productId: { $toObjectId: "$products.productId" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }],
          as: "products.productDetails",
        },
      },
      {
        $addFields: {
          "products.productDetails": {
            $arrayElemAt: ["$products.productDetails", 0],
          },
        },
      },
    ]);
// console.log(orderData);
    res.render('salesReport', { orderData,title : "Sales report" });
  } catch (error) {
    console.log(error.message);

  }
};


 exports.downloadReport = async (req, res) => {
  try {
    const { duration, format } = req.query;
    console.log(format);
    const currentDate = new Date();
    const startDate = new Date(currentDate - 1 * 24 * 60 * 60 * 1000);
    const orders = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $match: {
          status: "delivered",
          
        },
      },
      {
        $sort: { deliveryDate: -1 },
      },
      {
        $lookup: {
          from: "products",
          let: { productId: { $toObjectId: "$products.productId" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }],
          as: "products.productDetails",
        },
      },
      {
        $addFields: {
          "products.productDetails": {
            $arrayElemAt: ["$products.productDetails", 0],
          },
        },
      },
    ]);
    // console.log(orders);
    const totalSales = await Order.find({status : "delivered"}).count();
    const totalOrders = await Order.find().count();
    const date = new Date()
    data = {
      orders,
      date,
      totalSales,
      totalOrders

    }

    if (format === 'pdf') {
      const filepathName = path.resolve(__dirname, "../views/admin/invoice.ejs");

      const html = fs.readFileSync(filepathName).toString();
      const ejsData = ejs.render(html, data);

      const browser = await puppeteer.launch({ headless: "new"});
      const page = await browser.newPage();
      await page.setContent(ejsData, { waitUntil: "networkidle0"});
      const pdfBytes = await page.pdf({ format: "letter" });
      await browser.close();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename= Sales Report.pdf"
    );
    res.send(pdfBytes);
    } else if (format === 'excel') {
      // Generate and send an Excel report
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales Report');

      // Add data to the Excel worksheet (customize as needed)
      worksheet.columns = [
        { header: 'Order ID', key: 'orderId', width: 8 },
        { header: 'Product Name', key: 'productName', width: 50 },
        { header: 'Qty', key: 'qty', width: 5 },
        { header: 'Date', key: 'date', width: 12 },
        { header: 'Customer', key: 'customer', width: 15 },
        { header: 'Total Amount', key: 'totalAmount', width: 12 },
      ];
      // Add rows from the reportData to the worksheet
      orders.forEach((data) => {
        worksheet.addRow({
          orderId: data.uniqueId,
          productName: data.products.productDetails.name,
          qty: data.products.count,
          date: data.date.toLocaleDateString('en-US', { year:
            'numeric', month: 'short', day: '2-digit' }).replace(/\//g,
            '-'),
          customer: data.userName,
          totalAmount: data.products.totalPrice,
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=sales_report.xlsx`);
      const excelBuffer = await workbook.xlsx.writeBuffer();
      res.end(excelBuffer);
    } else {
      // Handle invalid format
      res.status(400).send('Invalid format specified');
    }
  } catch (error) {
    console.log(error.message);
   
  }
};