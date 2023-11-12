
const Wishlist = require("../model/wishlistModel");
const Cart = require("../model/cartModel");
const wishlist = require('../model/wishlistModel')


exports.Wishlist = async (req, res) => {
  try {
    let wishCount = 0;
    const userId = req.session.userId;
    const cart = await Cart.findOne({ userId: req.session.userId });
    let count = 0;

     cart ? count = cart.products.length : count = 0
    const wishlistItem = await Wishlist.findOne({ user: userId }).populate(
      "products.productId"
    );
    console.log(wishlistItem);
     wishlistItem ? wishCount = wishlistItem.products.length : 0
    res.render("wishlist", { user: req.session.user, count, wishlistItem,title : "Wishlist",wishCount });
  } catch (error) {
    console.log(error.message);
  }
};

exports. addToWishList = async (req, res) => {
  try {
    const userId = req.session.userId;
    // console.log(userId);
    if(!userId){
     return  res.redirect('/login')
    }
    const productId = req.body.productId;
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      const newWishList = new Wishlist({
        user: userId,
        products: [
          {
            productId: productId,
          },
        ],
      });
    await newWishList.save();
     
    }else{
        const existingProduct = await wishlist.products.find(
            (product) => product.productId.toString() === productId.toString()
          );
    
          console.log(existingProduct);
          if (existingProduct) {
            const removedProduct = await Wishlist.findOneAndUpdate(
        {user :userId},
              {
                $pull: { products: { productId: productId } },
              },
              { new: true }
            );
            if (removedProduct) {
                 res.json({removed : true})
            }
          } else {
            const addToWishList = await Wishlist.findOneAndUpdate(
               {user : userId},
              {
                $push: { products: { productId : productId} },
              },
              { new: true }
            );
            if(addToWishList){
                res.json({added : true})
            }
          }
    }
  } catch (error) {
    console.log(error.message);
  }
};


exports.removeWishlist = async (req, res) =>{
    try {
        const productId = req.body.productId
        const  userId = req.session.userId;
        const remove = await Wishlist.findOneAndUpdate({user : userId},
            {
                $pull :{
                    products : {
                        productId : productId
                    }
                }
            }
            )
            // console.log(remove);
            if (remove) {
                 res.json({remove : true})
            }
    } catch (error) {
        console.log(error.message);
    }
}