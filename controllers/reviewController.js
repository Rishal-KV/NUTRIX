const Review = require('../model/reviewModel')
const Order = require('../model/orderModel')


exports.addReview = async (req, res) => {
    try {
        const userReview = req.body.review;
        const orderId = req.body.orderId;
        const rating = req.body.rating;
        const selectedProduct = req.body.selectedProduct
        console.log(selectedProduct);
        
        const user = req.session.userId

      
            const existingReview = await Review.findOne({ product: selectedProduct });

            if (existingReview) {
                await Review.findOneAndUpdate(
                    { product: selectedProduct },
                    {
                        $push: {
                            reviews: { review: userReview, user: req.session.userId, rating: rating }
                        }
                    },
                    { new: true }
                );
                res.json({ review: true });
            } else {
                const newReview = new Review({
                    product: selectedProduct,
                    reviews: [{ review: userReview, userId: user, rating: rating }]
                });
                await newReview.save();
                res.json({ review: true });
            }
        
    } catch (error) {
        console.log(error.message);
       res.render('500')
    }
};

