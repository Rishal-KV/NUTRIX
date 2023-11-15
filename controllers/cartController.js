const Cart = require("../model/cartModel");
const Product = require("../model/productModel");
const User = require("../model/userModel");
const Address = require("../model/addressModel");
const Coupon = require('../model/couponModel')
const Wishlist = require('../model/wishlistModel');
const Offer  = require("../model/offerModel");
const { productDetails } = require("./userController");

exports.addToCart = async (req, res) => {
  try {
  
    const userId = req.session.userId;
    const productId = req.body.id
    const user = await User.findOne({ _id: userId })
    const product = await Product.findOne({ _id: productId }).populate('category')
    let offer = await product.populate('category.offer');
 
  let price = product.price
  if(offer && offer?.category?.offer?.expiryDate > new Date() && !offer?.category?.offer?.is_blocked){
    let percentage = product.price * offer.category.offer.discountAmount /100
     price  = product.price - Math.floor(percentage)
  }


    const cart = await Cart.findOne({ userId: userId })

    if (userId === undefined) {
      res.json({ login: true })
    } else {
      if (!cart && product.stock > 0) {
        const cart = new Cart({
          userId: userId,
          userName: user.username,
          products: [{
            productId: productId,
            count: 1,
            productPrice: price,
            totalPrice: 1 * price
          }]

        })
        const cartAdded = await cart.save()

      } else {
        // res.json({})
        const existingProduct = await cart.products.find(
          (product) => product.productId.toString() === productId.toString()
        );

        if (existingProduct) {
          res.json({ exist: true })
        } else if (product.stock > 0) {
          const newProduct = {
            productId: productId,
            count: 1,
            productPrice: price,
            totalPrice: 1 * price
          }

          const updatedCart = await Cart.findOneAndUpdate(
            { userId: userId },
            { $push: { products: newProduct } },
            { new: true }
          );



          res.json({ success: true })


        } else {
          res.json({ outofstock: true })
        }
      }
    }


    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
};

exports.getCart = async (req, res) => {
  try {
    let couponSelected;

    const couperr = req.app.locals.couperr
    req.app.locals.couperr = ""
    // console.log(couperr);
    let wishCount = 0
    const userId = req.session.userId;
    const coupon = await Coupon.find({
      $and: [
        { usedUsers: { $nin: [userId] } },
        { showStatus: true }
      ]
    });

    // console.log(userId);
    const cartData = await Cart.findOne({ userId: userId })
  
    //  await cartData.populate('products.productId.category')
    //   await cartData.populate('products.productId.category.offer')
      // console.log(cartData.products[0].productId.category);
   
    const wishlist = await Wishlist.findOne({ user: req.session.userId });


    // console.log(cartData);

    let count = 0;
    wishlist ? wishCount = wishlist.products.length : 0
    if (cartData ) {
      await cartData.populate('products.productId')
      await cartData.populate('products.productId.category')
      await cartData.populate('products.productId.category.offer')
        // for(let i = 0; i < cartData.products.length ; i++){
        //   let offer = await Offer.findOne({_id : cartData?.products[i]?.productId.category.offer})
        //   if(offer && offer.expiryDate > new Date() &&!offer.is_blocked){
        //     let percentage = cartData.products[i].productId.price * offer.discountAmount /100
        //     cartData.products[i].productPrice -=  Math.floor(percentage) 
        //     cartData.products[i].totalPrice -= Math.floor(percentage) 
        //   }
        // }
      const subTotal = cartData.products.reduce((acc, val) => acc + val.totalPrice, 0);
    
      let Total = cartData.products.reduce((acc, val) => acc + val.totalPrice, 0);

      let couponApplied = await Coupon.findOne({ couponName: cartData?.couponApplied })

      if (couponApplied) {
        Total = Total - couponApplied.maximumDiscount;
        couponSelected = await Coupon.findOne({ couponName: cartData?.couponApplied });

      }
      count = cartData.products.length;
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
          count, coupon, couponSelected,
          subTotal,
          couponApplied,
          title: "Cart",
          wishCount,
          couperr
        });
      } else {

        res.render("cart", {
          user: req.session.user,
          products: undefined,
          total: 0,
          count,
          title: "Cart",
          wishCount,
          couperr
        });
      }
    } else {


      res.render("cart", {
        user: req.session.user,
        products: undefined,
        total: 0,
        count, title: "Cart",
        wishCount,
        couperr
      });
    }

  } catch (error) {
    console.error(error.message);
    res.render('500')
  }
};

exports.updateCart = async (req, res) => {
  try {
    let productPrice ;
    const userId = req.session.userId;
    const productId = req.body.productId;
    let count = req.body.count;
    count = parseInt(count);
    
    const cartData = await Cart.findOne({ userId: userId });
    const productData = await Product.findOne({ _id: productId }).populate('category');
    const offer = await productData.populate('category.offer')
     if(offer && offer.category.offer.expiryDate > new Date() && offer.category.offer.is_blocked == false){
      let percentage = productData.price * offer.category.offer.discountAmount / 100;
     productPrice = productData.price - Math.floor(percentage)
     }else{
      productPrice = productData.price
     }
   

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
      // res.json({ success: false, message: "Invalid quantity." });
      return;
    }
    if (updatedQuantity <= 0 || updatedQuantity > productQuantity) {
      return;
    }
    // Update the product count and total price in the cart
    cartData.products[existingProductIndex].count = updatedQuantity;

    // Calculate the updated total price for the product
    

    const productTotal = productPrice * updatedQuantity;
    cartData.products[existingProductIndex].totalPrice = productTotal;

    // Save the updated cart
    await cartData.save();

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.render('500')
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
    res.render('500')
  }
};

exports.checkout = async (req, res) => {
  try {
    let wishCount = 0
    const userId = req.session.userId;
    const addressDetails = await Address.findOne({ user: userId });
    const carts = await Cart.findOne({ userId: req.session.userId });
    
    if(carts.products.length === 0){
      return res.redirect('/home')
    }
    const wishlist = await Wishlist.findOne({ user: req.session.userId })
    let count = 0;
    count = carts.products.length;
    wishlist ? wishCount = wishlist.products.length : 0
    let Total = carts.products.reduce((acc, val) => acc + val.totalPrice, 0);

    let couponApplied = await Coupon.findOne({ couponName: carts?.couponApplied })

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
      title: "Checkout",
      wishCount
    });
  } catch (error) {
    console.log(error.message);
    res.render('500')
  }
};
