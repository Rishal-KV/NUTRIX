const Cart = require("../model/cartModel")
const Product = require("../model/productModel");
const User = require('../model/userModel');
const Address = require('../model/addressModel')


exports.addToCart = async (req, res) => {
  try {
    const userId = req.session.userId
    const productId = req.body.productId
    const userData = await User.findOne({ _id: userId });
  let name = userData.username
  const productData = await Product.findOne({_id : productId});
  let productQuantity = productData.stock


  const cartData = await Cart.findOneAndUpdate(
    { userId: userId },
    {
      $setOnInsert: {
        userId: userId,
        userName: name,
        products: [],
      },
    },
    { upsert: true, new: true }
  );
  if (userId === undefined) {
    res.json({ login: true, message: "Please login and continue shopping!" });
    res.redirect('/')
  }

  const updatedProduct = cartData.products.find(
    (product) => product.productId === productId
  );
  const updatedQuantity = updatedProduct ? updatedProduct.count : 0;
  if (updatedQuantity + 1 > productQuantity) {
    return res.json({
      success: false,
      message: "Quantity limit reached!",
    });
  }
  const price = productData.price;
  const total = price;

  if (updatedProduct) {
    await Cart.updateOne(
      { userId: userId, "products.productId": productId },
      {
        $inc: {
          "products.$.count": 1,
          "products.$.totalPrice": total,
        },
      }
    );
  } else {
    cartData.products.push({
      productId: productId,
      productPrice: total,
      totalPrice: total,
    });
    await cartData.save();

  }

  res.json({ success: true });
} catch (error) {
  console.log(error.message);
  res.status(404).render("404");
  }
};



   
exports.getCart = async (req, res) =>{
  
   
      try {
        if (req.session.user) {
          const userId = req.session.userId;
          // console.log(userId);
          const cartData = await Cart.findOne({ userId: userId }).populate("products.productId");
          let count = 0;
          count = count + cartData.products.length;
   
      
          if (cartData) {
            const products = cartData.products;
            if (products.length > 0) {
         
              const total = await Cart.aggregate([
                { $match: { userId: userId } },
                { $unwind: "$products" },
                {
                  $group: {
                    _id: null,
                    total: {
                      $sum: {
                        $multiply: ["$products.productPrice", "$products.count"],
                      },
                    },
                  },
                },
              ]);
              
      
              res.render("cart", { user: req.session.user, products: products, total: total[0].total,count});
            } else {
              res.render("cart", { user: req.session.user, products: undefined, total: 0,count});
            }
          } else {
            res.render("cart", { user: req.session.user, products: undefined, total: 0,count});
          }
        }else{
          res.redirect('/login')
        }
       
      } catch (error) {
        console.error(error.message);
       
       
      }
  
}



exports.updateCart = async(req, res) =>{
  

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
  
  }

  exports.removeCart = async(req, res) =>{
    try {
      const product = req.body.productId
      const  user = req.session.userId;
      const userCart = Cart.findOne({userId : user});
      if(userCart){
        await Cart.findOneAndUpdate({userId : user},{
          $pull :{
            products : {
              productId : product
            }
          }
        })
        res.json({success : true});
      }
    } catch (error) {
      console.log(error.message);
    }
  }


  exports.checkout = async(req, res) =>{
    try {


      const userId = req.session.userId
      const addressDetails = await Address.findOne({user : userId})
      const carts = await Cart.findOne({ userId: req.session.userId }); //
      let count = 0;
      count = count + carts.products.length;
        
      const total = await Cart.aggregate([
        { $match: { userId: userId } },
        { $unwind: "$products" },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $multiply: ["$products.productPrice", "$products.count"],
              },
            },
          },
        },
      ]);
      const Total = total[0].total
      const cartData = await Cart.findOne({ userId: userId }).populate("products.productId");
      const products = cartData.products


      res.render('checkout',{user : req.session.user,addressDetails,Total,products,count})
    } catch (error) {
      
    }
  }