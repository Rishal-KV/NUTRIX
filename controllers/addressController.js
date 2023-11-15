const Address = require('../model/addressModel');
const User = require('../model/userModel');
const Order = require('../model/orderModel')
const Cart = require('../model/cartModel');
const Wishlist = require('../model/wishlistModel')

exports.profile = async (req, res) =>{
    try {
    


      let wishCount = 0
      const  userId = req.session.userId
      const userDetails = await User.findOne({_id : userId})
      let wallHistory = userDetails.walletHistory.reverse().slice(0,5)
      // console.log(wallHistory);

      const addressDetails = await Address.findOne({user : userId})
      const ordersDetails = await Order.find({user : userId}).populate("products.productId").sort({ date: -1 });
      // console.log(ordersDetails);
      const wishlist = await Wishlist.findOne({user : req.session.userId})
      const carts = await Cart.findOne({ userId: req.session.userId }); 
      wishlist?wishCount = wishlist.products.length : 0
      
let count = 0

      if (carts) {
        count = carts.products.length;
      }
      res.render('profile',{
        user : req.session.user,
        addressDetails,
        userDetails,
        ordersDetails,
        wallHistory,
        count,
        title : "Profile ",
        wishCount,
        updateAdd: req.session.address,
        changePass :req.session.changePassword
      },(err, html)=>{
        if(!err){
          req.session.address= false;
          req.session.changePassword = false
          res.send(html)
        }else{
          console.log(err.message);
        }
      })
    } catch (error) {
       console.log(error.message);
       res.render('500')
    }
  }
  

  exports.address = async (req, res) =>{
    try {

      const carts = await Cart.findOne({ userId: req.session.userId });
      const wishlist = await Wishlist.findOne({user : req.session.userId}) 
      carts ? count = carts.products.length : count = 0

      wishlist ? wishCount = wishlist.products.length : wishCount = 0
      
      res.render('addAddress',{user : req.session.user,count,title : "Profile"});

    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
  }


  
  exports.toAddAddress = async (req, res) => {
    try {
      const userId = req.session.userId;
      // const userData = await User.findOne({ _id: userId });
   
      const { fullname, country, housename, city, state, pin, mobile, email } = req.body;
      console.log(req.body);
      const address = await Address.findOne({ user: userId });
      if (address) {
        // If an address already exists, update it
        await Address.updateOne({ user: userId }, {
          $push: {
            address: {
              fullname: fullname,
              mobile: mobile,
              email: email,
              houseName: housename,
              city: city,
              state: state,
              country: country,
              pin: pin,
            },
          },
        });
      } else {
        // If no address exists, create a new address document
        const newAddress = new Address({
          user: userId,
          address: [{
            fullname: fullname,
            mobile: mobile,
            email: email,
            houseName: housename,
            city: city,
            state: state,
            country: country,
            pin: pin,
          }],
        });
        await newAddress.save();
      }
      req.session.address = 2
   res.redirect('/profile')
    } catch (error) {
      console.error(error.message);
      res.render('500')
    }
  };
  




exports.selectedAddress = async(req, res) =>{
  try {
      const address = req.body.selectedAddress
    
      console.log(address);
      if(!address){
        res.redirect('/changeaddress')
      }
      req.session.selectedAddress = address
      res.redirect('/checkout')
  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
}

exports.geteditaddress = async(req, res) =>{
  try {
    const userId = req.session.userId
    const addressId = req.query.id
    const addressData = await Address.findOne(
      { user: userId, "address._id": addressId },
      { "address.$": 1 }
    );
    const carts = await Cart.findOne({ userId: req.session.userId });
    let wishlist = await Wishlist.findOne({user : req.session.userId}) ;
    wishlist ? wishCount = wishlist.products.length : wishCount = 0
    let count = 0;
     count = carts?.products?.length;
    const address = addressData.address[0]
     
    console.log(address);
// console.log(addressDetails);
      res.render('editaddress',{user : req.session.user,address,count,title : "edit Address",wishCount})

      
    

  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
}


  exports.editaddress = async(req, res) =>{
    try {
        const userId = req.session.userId
      const addressId = req.body.id;
      console.log(userId);
      console.log(addressId);
      const { fullname, country, housename, city, state, pin, mobile, email } = req.body;
      const updated = await Address.updateOne(
        { user: userId, "address._id": addressId },
        {
          $set: {
            "address.$.fullname": fullname,
            "address.$.mobile": mobile,
            "address.$.email": email,
            "address.$.houseName": housename,
            "address.$.city": city,
            "address.$.state": state,
            "address.$.country" : country,
            "address.$.pin": pin,
           
          },
        })
        console.log(updated);
        res.redirect('/profile')
    } catch (error) {
      console.log(error.message);
      res.render('500')
    }
  }

  exports.remove = async(req,res) =>{
    try {
       const addressId = req.query.id;
       const userId = req.session.userId
       const result = await Address.updateOne(
        { user: userId  },
        { $pull: { address: { _id: addressId } } }
   
      );
    req.session.address = 1
    res.redirect('/profile')
    

    } catch (error) {
      console.log(error.message);
      res.render('500')
    }
  }





  exports.toAddAddressCheckout = async (req, res) => {
    try {
      const userId = req.session.userId;
      // const userData = await User.findOne({ _id: userId });
   
      const { fullname, country, housename, city, state, pin, mobile, email } = req.body;
      console.log(req.body);
      const address = await Address.findOne({ user: userId });
      if (address) {
        // If an address already exists, update it
        await Address.updateOne({ user: userId }, {
          $push: {
            address: {
              fullname: fullname,
              mobile: mobile,
              email: email,
              houseName: housename,
              city: city,
              state: state,
              country: country,
              pin: pin,
            },
          },
        });
        res.json({added : true})
      } else {
        // If no address exists, create a new address document
        const newAddress = new Address({
          user: userId,
          address: [{
            fullname: fullname,
            mobile: mobile,
            email: email,
            houseName: housename,
            city: city,
            state: state,
            country: country,
            pin: pin,
          }],
        });
        await newAddress.save();
        res.json({added:true})
      }
 
    } catch (error) {
      console.error(error.message);
      res.render('500')
    }
  };
  