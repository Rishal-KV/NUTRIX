exports.coupon = async(req, res) =>{
    try {
        res.render('coupon');
    } catch (error) {
        console.log(error.message);
    }
}

exports.addCoupon = async(req, res) =>{
    try {
        res.render('addcoupon')
    } catch (error) {
        console.log(error.message);
    }
}