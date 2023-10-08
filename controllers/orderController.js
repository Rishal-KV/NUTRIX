const Cart = require("../model/cartModel");
const Address = require("../model/addressModel");
const User = require("../model/userModel");
const Product = require("../model/productModel");
const Order = require("../model/orderModel");
exports.orderPlace = async(req, res) =>{
    try {
        const userId = req.session.userId;
        const addressId = req.body.selectedAddress.trim()
        const cartData = await Cart.findOne({userId : userId})
        const products =  cartData.products
        const total = parseInt(req.body.Total);
        const paymentMethods = req.body.payment;
        console.log(paymentMethods);
        const userData = await User.findOne({ _id: userId });
          
        const name = userData.username;
        const uniNum = Math.floor(Math.random() * 900000) + 100000;
        const status = paymentMethods === "COD" ? "placed" : "pending";
        if(paymentMethods == undefined){

        }else{
          const  selectedAddress = await Address.findOne(
            { user: userId, 'address._id': addressId },
            { 'address.$': 1 }
          );
             const address = selectedAddress.address[0]
            console.log(selectedAddress);
          const order = new Order({
            deliveryDetails: address,
            uniqueId: uniNum,
            userId: userId,
            userName: name,
            paymentMethod: paymentMethods,
            products: products,
            totalAmount: total,
            date: new Date(),
            status: status,
          });
          const orderDetails = order.save();
          res.render('successful',{user : req.session.user})
            
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

exports.cancelOrder = async(req, res) =>{
  try {
    const orderId = req.body.orderId;
   const cancelOrder = await  Order.updateOne({_id : orderId},{
    $set :{
      status : "cancelled"
    }
  
   })
   if (cancelOrder) {
       res.json({success : true})
   }
  } catch (error) {
    console.log(error.message);
  }
}


exports.orderDetails = async(req, res) =>{
  try {
    const orderId = req.query.id;
    const orderDetails = await Order.findOne({_id : orderId}).populate('products.productId');
    console.log(orderDetails);
    res.render('orderdetails',{user : req.session.user,orderDetails})
  } catch (error) {
    console.log(error.message);
  }
}