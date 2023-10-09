const Address = require('../model/addressModel');
const User = require('../model/userModel');
const Order = require('../model/orderModel')
const Cart = require('../model/cartModel')

exports.profile = async (req, res) =>{
    try {
      const  userId = req.session.userId
      const userDetails = await User.findOne({_id : userId})
      const addressDetails = await Address.findOne({user : userId})
      const ordersDetails = await Order.find()

      .populate("products.productId")
      .sort({ date: -1 });
      const carts = await Cart.findOne({ userId: req.session.userId }); 
     let count = 0;
     count = count + carts.products.length;
      res.render('profile',{user : req.session.user,addressDetails,userDetails,ordersDetails,count})
    } catch (error) {
       console.log(error.message);
    }
  }
  

  exports.address = async (req, res) =>{
    try {

      const carts = await Cart.findOne({ userId: req.session.userId }); 
      let count = 0;
      count = count + carts.products.length;
      
      res.render('addAddress',{user : req.session.user,count});

    } catch (error) {
        console.log(error.message);
    }
  }


  
  exports.toAddAddress = async (req, res) => {
    try {
      const userId = req.session.userId;
      const userData = await User.findOne({ _id: userId });
      const { fullname, country, housename, city, state, pin, mobile, email } = req.body;
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
      res.redirect('/profile');
    } catch (error) {
      console.error(error.message);
      // Handle the error appropriately, e.g., sending an error response to the client.
    }
  };
  

// exports.changeAddress = async(req, res) =>{ 
//   try {
 
//     res.render('changeaddress',{user : req.session.user,addressDetails})
//   } catch (error) {
//     console.log(error.message);
//   }
// }


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
    let count = 0;
     count = count + carts.products.length;
    const address = addressData.address[0]
    console.log(address);
// console.log(addressDetails);
      res.render('editaddress',{user : req.session.user,address,count})

      
    

  } catch (error) {
    console.log(error.message);
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
      
      res.json({success : true})
      res.redirect('/profile')

    } catch (error) {
      console.log(error.message);
    }
  }