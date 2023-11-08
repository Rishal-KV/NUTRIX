const Cart = require("../model/cartModel");

const Address = require("../model/addressModel");
const User = require("../model/userModel");
const Order = require("../model/orderModel");
const Product = require('../model/productModel');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Coupon = require('../model/couponModel');
const Wishlist = require('../model/wishlistModel')
const Review = require('../model/reviewModel')

var instance = new Razorpay({
  key_id: process.env.RAZ_ID,
  key_secret: process.env.RAZ_KEY,
});

exports.orderPlace = async (req, res) => {
  try {
    const userId = req.session.userId;
    let  addressId ;
    req.body.selectedAddress ? addressId = req.body.selectedAddress.trim() : undefined
     
    const cartData = await Cart.findOne({ userId: userId })
    const cart = await Cart.findOne({ userId: userId }).populate('products.productId')
  
    const products = cartData.products
    const productStock = cart.products
    const total = parseInt(req.body.Total);

    const paymentMethods = req.body.payment;
    // console.log(paymentMethods);

    const userData = await User.findOne({ _id: userId });

    const name = userData.username;
    const uniNum = Math.floor(Math.random() * 900000) + 100000;
    let status = paymentMethods === "COD" ? "placed" : "pending";


    if(!addressId){
      return res.json({addAddress : true})
    }

 for(let i = 0; i < productStock.length; i++){
    let stock = productStock[i].productId.stock
    if(stock == 0){
     
      return res.json({outofstock : true})
    }

 }


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

    const couponFound = await Coupon.findOne({ couponName: cartData?.couponApplied });
    if (couponFound) {
      await Coupon.findOneAndUpdate({ couponName: cartData.couponApplied }, { $addToSet: { usedUsers: userId } });
    }
    if (status == "placed") {
      const stockReduce = cartData.products
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
      await Cart.findOneAndUpdate({ userId }, { $set: { products: [], couponApplied: '' } });
      res.json({ cash: true })
    } else if (paymentMethods === "wallet") {
      if (userData.wallet >= orderDetails.totalAmount) {
        
        let result = await User.updateOne({ _id: req.session.userId }, {
          $inc: {
            wallet: -orderDetails.totalAmount
          },
          $push: {
            walletHistory: {
              amount: orderDetails.totalAmount,
              status: "debit",
              date : new Date()
            }
          }
        })
        // console.log(result);
      
        const stockReduce = cartData.products

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
       
        await Cart.findOneAndUpdate({ userId }, { $set: { products: [], couponApplied: '' } });

        await Order.findByIdAndUpdate(
          { _id: orderId },
          { $set: { status: "placed" } }
        );
        res.json({ wallet: true })
      } else {
        res.json({ balance: true  })
      }
    } else if(paymentMethods == "online payment") {
      // console.log("online payment");
      let Total = await Order.findOne({_id : orderId})
     
      // console.log(orderId);
      
      instance.orders.create({
        amount: Total.totalAmount * 100,
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
    res.render('500')
  }
}

exports.success = async (req, res) => {
  try {
    let wishCount = 0
    const wishlist = await Wishlist.findOne({ user: req.session.userId });
    wishlist ? wishCount = wishlist.products.length : 0
    const cart = await Cart.findOne({ userId: req.session.userId })
    let count = 0

    count = cart.products.length
    res.render('successful', { count, user: req.session.user, title: "Success", wishCount });
  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
}


exports.cancelOrder = async (req, res) => {
  try {

    const orderId = req.body.orderId;
    const user = req.session.userId
    let orderData = await Order.findOne({ _id: orderId })
     let products = orderData.products
     for(let i = 0 ; i < products.length; i++){
      const purchasedProduct = await Product.findOneAndUpdate(
        { _id: products.productId },
        { $inc: { stock:  products[i].count } } 
      );
     }
   
    // console.log(totalAmount);
    const cancelOrder = await Order.updateOne({ _id: orderId }, {
      $set: {
        status: "cancelled"
      }

    })
   
    let walletBal = await User.findOne({ _id: user },
      { wallet: 1 })
    // console.log(walletBal);
    if (orderData.paymentMethod == "online payment") {
      const wallet = await User.updateOne(
        { _id: user },
        {
          $set: { wallet: walletBal.wallet + orderData.totalAmount },
          $push: {
            walletHistory: {
              date: new Date(),
              amount: orderData.totalAmount,
              status : "credit"
            }
          }
        }
      );
    }

   

    if (cancelOrder) {
      res.json({ success: true })
    }
  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
}


exports.orderDetails = async (req, res) => {
  try {
    let reviewed = false
    const orderId = req.query.id;
    const userId = req.session.userId
    const orderDetails = await Order.findOne({ _id: orderId }).populate('products.productId');
    let products = orderDetails.products
  
 

     for (let product of products){
      let review = await Review.findOne({product : product.productId._id,userId : req.session.userId})
      console.log(review);
      if(review){
        reviewed = true
      }else{
       
        reviewed = false
      }      
     }
    res.render('orderdetails', { user: req.session.user, orderDetails,reviewed})
  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
}

exports.verifypayment = async (req, res) => {
  try {
    const details = req.body;
    
    const userId = req.session.userId
    const cartData = await Cart.findOne({ userId: userId })

    const hmac = crypto.createHmac("sha256", process.env.RAZ_KEY);
    hmac.update(
      details.payment.razorpay_order_id +
      "|" +
      details.payment.razorpay_payment_id
    );
    const hmacValue = hmac.digest("hex");
    if (hmacValue === details.payment.razorpay_signature) {
                
      const stockReduce =  cartData.products
    
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
          $set: {
            products: [],
            couponApplied : ""
          }
        })
        const couponFound = await Coupon.findOne({ couponName: cartData?.couponApplied });
        if (couponFound) {
          await Coupon.findOneAndUpdate({ couponName: cartData.couponApplied }, { $addToSet: { usedUsers: userId } });
        }
      await Order.findByIdAndUpdate(
        { _id: details.order.receipt },
        { $set: { status: "placed" } }
      );

      
      res.json({ payment: true })
    }

  } catch (error) {
console.log(error.message);
res.render('500')
  }
}