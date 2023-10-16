
const Wishlist = require("../model/wishlistModel");
const Cart = require("../model/cartModel");


exports.Wishlist = async (req, res) => {
  try {
    const userId = req.session.userId;
    const cart = await Cart.findOne({ userId: req.session.userId });
    let count = 0;

    count = count + cart.products.length;
    const wishlistItem = await Wishlist.findOne({ user: userId }).populate(
      "products.productId"
    );

    res.render("wishlist", { user: req.session.user, count, wishlistItem });
  } catch (error) {
    console.log(error.message);
  }
};

exports.addToWishList = async (req, res) => {
  try {
    const userId = req.session.userId;
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
