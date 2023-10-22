const Cart = require("../model/cartModel");
const Product = require("../model/productModel");
const User = require("../model/userModel");
const Address = require("../model/addressModel");
const Coupon = require('../model/couponModel')

exports.addToCart = async (req, res) => {
  try {
    const userId = req.session.userId;
    const productId = req.body.id
    const user = await User.findOne({_id : userId})
    const product = await Product.findOne({_id : productId})
    
    const cart = await Cart.findOne({userId : userId })
    const price = product.price
    if (userId === undefined) {
           res.json({login : true})
    }else{
          if(!cart){
                const cart = new Cart({
                   userId : userId,
                   userName : user.username,
                   products : [{
                         productId : productId,
                         count : 1,
                         productPrice : price ,
                         totalPrice : 1 * price 
                   }]
 
                })
                const cartAdded =  await cart.save()
          }else{
                
                const existingProduct = await cart.products.find(
                      (product) => product.productId.toString() === productId.toString()
                );
                      
                if (existingProduct) {
                      res.json({exist : true})
                }else{
                const newProduct = {
                      productId : productId,
                      count : 1,
                      productPrice : price,
                      totalPrice : 1 * price
                }

                const updatedCart = await Cart.findOneAndUpdate(
                      { userId: userId },
                      { $push: { products: newProduct } },
                      { new: true }
                    );

                res.json({success : true})

                }
          }
    }


    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.session.userId;
    const coupon = await Coupon.find({ usedUsers: { $nin: [userId] } })
    
      // console.log(userId);
      const cartData = await Cart.findOne({ userId: userId }).populate(
        "products.productId"
      );
      // console.log(cartData);
    
      let count = 0;

      if (cartData) {
        const subTotal = cartData.products.reduce((acc, val)=> acc+val.totalPrice,0);
        let Total = cartData.products.reduce((acc, val)=> acc+val.totalPrice,0);
        
        let couponApplied = await Coupon.findOne({couponName : cartData?.couponApplied})
     
        if (couponApplied) {
          Total = Total - couponApplied.maximumDiscount;
        }
        count = count + cartData.products.length;
        let products = cartData.products;
        if (products.length > 0) {
          // const total = await Cart.aggregate([
          //   { $match: { userId: userId } },
          //   { $unwind: "$products" },
          //   {
          //     $group: {
          //       _id: null,
          //       total: {
          //         $sum: {
          //           $multiply: ["$products.productPrice", "$products.count"],
          //         },
          //       },
          //     },
          //   },
          // ]);

          res.render("cart", {
            user: req.session.user,
            products: products,
            total: Total,
            count,coupon,
            subTotal,
            couponApplied
          });
        } else {
         
          res.render("cart", {
            user: req.session.user,
            products: undefined,
            total: 0,
            count,
          });
        }
      } else {

     
        res.render("cart", {
          user: req.session.user,
          products: undefined,
          total: 0,
          count,
        });
      }
  
  } catch (error) {
    console.error(error.message);
  }
};

exports.updateCart = async (req, res) => {
  try {
    const userId = req.session.userId;
    const productId = req.body.productId;
    let count = req.body.count;
    count = parseInt(count);

    const cartData = await Cart.findOne({ userId: userId });
    const productData = await Product.findOne({ _id: productId });

    if (!cartData || !productData) {
      res.json({ success: false, message: "Cart or product not found." });
      return;
    }

    const productQuantity = productData.stock;

    const existingProductIndex = cartData.products.findIndex(
      (product) => product.productId === productId
    );

    if (existingProductIndex === -1) {
      res.json({ success: false, message: "Product not found in the cart." });
      return;
    }

    const existingProduct = cartData.products[existingProductIndex];
    const updatedQuantity = existingProduct.count + count;

    if (updatedQuantity < 0 || updatedQuantity > productQuantity) {
      res.json({ success: false, message: "Invalid quantity." });
      return;
    }
    if (updatedQuantity <= 0 || updatedQuantity > productQuantity) {
      return;
    }
    // Update the product count and total price in the cart
    cartData.products[existingProductIndex].count = updatedQuantity;

    // Calculate the updated total price for the product
    const productPrice = productData.price;
    const productTotal = productPrice * updatedQuantity;
    cartData.products[existingProductIndex].totalPrice = productTotal;

    // Save the updated cart
    await cartData.save();

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

exports.removeCart = async (req, res) => {
  try {
    const product = req.body.productId;
    const user = req.session.userId;
    const userCart = Cart.findOne({ userId: user });
    if (userCart) {
      await Cart.findOneAndUpdate(
        { userId: user },
        {
          $pull: {
            products: {
              productId: product,
            },
          },
        }
      );
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.checkout = async (req, res) => {
  try {
    const userId = req.session.userId;
    const addressDetails = await Address.findOne({ user: userId });
    const carts = await Cart.findOne({ userId: req.session.userId }); //
    let count = 0;
    count = count + carts.products.length;
    let Total = carts.products.reduce((acc, val)=> acc+val.totalPrice,0);
        
    let couponApplied = await Coupon.findOne({couponName : carts?.couponApplied})
 
    if (couponApplied) {
      Total = Total - couponApplied.maximumDiscount;
    }
    // const total = await Cart.aggregate([
    //   { $match: { userId: userId } },
    //   { $unwind: "$products" },
    //   {
    //     $group: {
    //       _id: null,
    //       total: {
    //         $sum: {
    //           $multiply: ["$products.productPrice", "$products.count"],
    //         },
    //       },
    //     },
    //   },
    // ]);
    // const Total = total[0].total;
    const cartData = await Cart.findOne({ userId: userId }).populate(
      "products.productId"
    );
    const products = cartData.products;

    res.render("checkout", {
      user: req.session.user,
      addressDetails,
      Total,
      products,
      count,
    });
  } catch (error) {
    console.log(error.message);
  }
};
