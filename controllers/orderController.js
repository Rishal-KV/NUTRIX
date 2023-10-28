const Cart = require("../model/cartModel");
const Address = require("../model/addressModel");
const User = require("../model/userModel");
const Order = require("../model/orderModel");
const Product = require('../model/productModel');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Coupon = require('../model/couponModel')

var instance = new Razorpay({
  key_id: process.env.RAZ_ID,
  key_secret: process.env.RAZ_KEY,
});

exports.orderPlace = async (req, res) => {
  try {
    const userId = req.session.userId;
    const addressId = req.body.selectedAddress.trim()
    const cartData = await Cart.findOne({ userId: userId })
    const products = cartData.products
    const total = parseInt(req.body.Total);
 
    const paymentMethods = req.body.payment;

    const userData = await User.findOne({ _id: userId });

    const name = userData.username;
    const uniNum = Math.floor(Math.random() * 900000) + 100000;
    let status = paymentMethods === "COD" ? "placed" : "pending";



    const selectedAddress = await Address.findOne(
      { user: userId, 'address._id': addressId },
      { 'address.$': 1 }
    );
    const address = selectedAddress.address[0]
    const order = new Order({
      deliveryDetails: address,
      uniqueId: uniNum,
      user: userId,
      userName: name,
      paymentMethod: paymentMethods,
      products: products,
      totalAmount: total,
      date: new Date(),
      status: status,
    });

    const orderDetails = await order.save();
    const orderId = orderDetails._id

      const couponFound = await Coupon.findOne({couponName : cartData?.couponApplied});
      if (couponFound) {
        await Coupon.findOneAndUpdate({couponName:cartData.couponApplied},{$addToSet:{usedUsers:userId}});
      }
        
      

 

    if (status == "placed") {
      const stockReduce = cartData.products
      for (let i = 0; i < stockReduce.length; i++) {
        const removeCart = await Cart.findOneAndUpdate({ userId: userId },
          {
            $pull: {
              products: {}
            }
          })
        const productId = stockReduce[i].productId;
        const updatedProduct = await Product.findByIdAndUpdate(
          productId,
          {
            $inc: { stock: -stockReduce[i].count }
          },
          { new: true }
        );

      }
      await Cart.findOneAndUpdate({userId},{$set:{product:[],couponApplied:''}});
      res.json({ cash: true })
    } else {

      let Total = cartData.products.reduce((acc, curr) => {
        return acc = acc + curr.totalPrice
      }, 0)
      // console.log(orderId);
      await Cart.findOneAndUpdate({userId},{$set:{product:[],couponApplied:''}});
      instance.orders.create({
        amount: Total * 100,
        currency: "INR",
        receipt: orderId,

      }, function (err, order) {
        if (err) {
          console.log(err);
        } else {
          res.json({ order })
        }
      })

    }
  } catch (error) {
    console.log(error.message)
  }
}

exports.success = async (req, res) => {
  try {

    const cart = await Cart.findOne({ userId: req.session.userId })
    let count = 0

    count = count + cart.products.length
    res.render('successful', { count, user: req.session.user,title : "Success----------------1-------00" });
  } catch (error) {
    console.log(error.message);
  }
}


exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    console.log(orderId);
    const cancelOrder = await Order.updateOne({ _id: orderId }, {
      $set: {
        status: "cancelled"
      }

    })



    if (cancelOrder) {
      res.json({ success: true })
    }
  } catch (error) {
    console.log(error.message);
  }
}


exports.orderDetails = async (req, res) => {
  try {
    const orderId = req.query.id;
    const orderDetails = await Order.findOne({ _id: orderId }).populate('products.productId');



    res.render('orderdetails', { user: req.session.user, orderDetails })
  } catch (error) {
    console.log(error.message);
  }
}

exports.verifypayment = async (req, res) => {
  try {
 
   
   
    const details = req.body;
    console.log(details);
    const userId = req.session.userId
    const cart = await Cart.findOne({userId});
    

    const hmac = crypto.createHmac("sha256", process.env.RAZ_KEY);
    hmac.update(
      details.payment.razorpay_order_id +
      "|" +
      details.payment.razorpay_payment_id
    );
    const hmacValue = hmac.digest("hex");
    if (hmacValue === details.payment.razorpay_signature) {

      const stockReduce = cart.products
      console.log(stockReduce[0].count);
      for (let i = 0; i < stockReduce.length; i++) {

        const productId = stockReduce[i].productId;
  
        const updatedProduct = await Product.findByIdAndUpdate(
          productId,
          {
            $inc: { stock: -stockReduce[i].count }
          },
          { new: true }
        );

      }
      const removeCart = await Cart.findOneAndUpdate({ userId: userId },
        {
          $pull: {
            products: {}
          }
        })

      await Order.findByIdAndUpdate(
        { _id: details.order.receipt },
        { $set: { status: "placed" } }
      );

      
      res.json({payment : true})
    }
   
  } catch (error) {

  }
}