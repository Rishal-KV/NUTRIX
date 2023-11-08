const Review = require('../model/reviewModel')
const Order = require('../model/orderModel')


exports.addReview = async (req, res) => {
    try {
        const userReview = req.body.review;
        const orderId = req.body.orderId;
        const rating = req.body.rating;
        const order = await Order.findOne({ _id: orderId });
        const user = req.session.userId

        for (const product of order.products) {
            const existingReview = await Review.findOne({ product: product.productId });

            if (existingReview) {
                await Review.findOneAndUpdate(
                    { product: product.productId },
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
                    product: product.productId,
                    reviews: [{ review: userReview, userId: user, rating: rating }]
                });
                await newReview.save();
                res.json({ review: true });
            }
        }
    } catch (error) {
        console.log(error.message);
       res.render('500')
    }
};

