const Review = require('../model/reviewModel')
const Order = require('../model/orderModel')


exports.addReview = async (req, res) => {
    try {
        const userReview = req.body.review;
        const orderId = req.body.orderId;
        const  rating = req.body.rating
        const order = await Order.findOne({ _id: orderId });

        for (const product of order.products) {
            const existingReview = await Review.findOne({ product: product.productId });

            if (existingReview) {


                await Review.findOneAndUpdate(
                    { product: product.productId },
                    {
                        $push: {
                            reviews: userReview
                        },
                        $inc: {
                            rating: rating 
                        }
                    },
                    { new: true } 
                );
                
              res.json({review: true})
            } else {
                const newReview = new Review({
                    
                    user : req.session.user,
                    userId : req.session.userId,    
                    product: product.productId,
                    reviews: [{ review: userReview }],
                    rating : rating
                });
                await newReview.save();
                res.json({review: true})
            }
        }

    } catch (error) {
        console.log(error.messag)
      
    }
};

