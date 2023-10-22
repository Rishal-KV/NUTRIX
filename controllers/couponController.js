
const Coupon = require('../model/couponModel')
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
        res.redirect('/couponmanagement')
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
    
        const couponName = req.body.couponame
        const Total = Number(req.body.total)
        const user = req.session.userId
            const couponUsed = Coupon.findOne({couponName: couponName,
             usedUsers :{
                $in : [req.session.userId]
             }
            })
         if (couponUsed) {
            res.json({used : true});
         }else{
            const coupon = await Coupon.findOne({couponName : couponName});
             if(coupon){
                if(coupon.lastDate<= new Date()){
                    res.json({date :true})
                }
             }
         }
        
      
        
    } catch (error) {
        
    }
}


