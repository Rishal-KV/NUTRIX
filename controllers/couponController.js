
const Coupon = require('../model/couponModel')
const Cart = require('../model/cartModel');
exports.coupon = async(req, res) =>{
    try {
        const coupons = await Coupon.find();
        // console.log(coupons);
        res.render('coupon',{coupons});
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


exports.addcouponPost = async(req,res) =>{
    try {
      const {name,purchase,discount, date} = req.body
    //    console.log(date);
      const coupon = new  Coupon({
        couponName : name,
        minimumPurchase : purchase,
        maximumDiscount : discount,
        lastDate : date
      })
        res.redirect('/admin/couponmanagement')
      await coupon.save();
    } catch (error) {
        
    }
}

exports.action = async(req, res) =>{
    try {
        const couponId = req.query.cpid;
        const coupon = await Coupon.findOne({_id : couponId});
        if(coupon){
            
            if (!coupon.showStatus) {
                 await Coupon.updateOne({_id : couponId},
                    {$set : {
                        showStatus : true
                    }}
                    )
                    res.json({showStatus : true})
            } else{
                await Coupon.updateOne({_id : couponId},
                    {$set : {
                        showStatus : false
                    }}
                    )  
                    res.json({showStatus : false})
            }
        }

    } catch (error) {
        console.log(error.message);
    }
}

exports.applyCoupon = async(req, res) =>{
    try {
      const user = req.session.userId;
    
     const couponName = req.body.coupon
     console.log(couponName);
     const cart = await Cart.findOne({userId : user}).populate('products.productId');
    //  const Total = cart.products.reduce((acc, val)=> acc+val.totalPrice,0);
    //  console.log(Total);
    const couponFound = Coupon.findOne({couponName});
    const currentDate = new Date()

    const usedCoupon = await Coupon.find({couponName, usedUsers: { $in: [user] } })
   
    if(couponFound.lastDate < currentDate){
        
        res.json({expired : true})
    }else if(couponFound && usedCoupon.length == 0){
          console.log("NKENRKENRN");
        if(Total < couponFound.minimumPurchase){
            // res.json({})
        }else{
            await Cart.findOneAndUpdate({userId : user},{$set:{couponApplied:couponName}})
            
            res.json({applied : true,message:'Coupon applied'})
        }
    }

  

        
      
        
    } catch (error) {
        
    }
}


