
const Coupon = require('../model/couponModel')
const Cart = require('../model/cartModel');
const { getLogger } = require('nodemailer/lib/shared');
exports.coupon = async(req, res) =>{
    try {
        const coupons = await Coupon.find();
        // console.log(coupons);
        res.render('coupon',{coupons,title : "Coupon management"});
    } catch (error) {
        console.log(error.message);
    }
}

exports.addCoupon = async(req, res) =>{
    try {
        var coupErr = req.app.locals.coupErr
        var coupErrPur  = req.app.locals.coupErrPur
        var coupErrDis = req.app.locals.coupErrDis
        req.session.dateValidation
        req.app.locals.coupErr = ""
        req.app.locals.coupErrPur = " "
        req.app.locals.coupErrDis = " "
        res.render('addcoupon',{title: "Coupon management",
        title : "Coupon management",
        coupErr,
        coupErrPur,
        coupErrDis,
        dateVal : req.session.dateValidation
    },(err,html)=>{
            if(!err){
                req.session.dateValidation = false
                res.send(html)
            }else{
                  console.log(err.message);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}


exports.addcouponPost = async(req,res) =>{
    try {
      const {name,purchase,discount, date} = req.body
    let existingCoupon = await Coupon.findOne({couponName : name})
     let today = new Date();
     let expireDate = new Date(date)
     if(expireDate < today){
        req.session.dateValidation = 1
       return  res.redirect('/admin/addcoupon') 
     }
    if(existingCoupon){
        req.app.locals.coupErr = "Coupon Already Added"
        return res.redirect('/admin/addcoupon')
    }else if(purchase < 0){
        req.app.locals.coupErrPur = "cannot set negative values"
        return res.redirect('/admin/addcoupon')
    }else if(discount < 0){
        req.app.locals.coupErrDis = "cannot set negative values"
        return res.redirect('/admin/addcoupon')
    }else{

        const coupon = new  Coupon({
            couponName : name,
            minimumPurchase : purchase,
            maximumDiscount : discount,
            lastDate : date
          })
          await coupon.save();
            res.redirect('/admin/couponmanagement')
    }
     
    
    } catch (error) {
        
    }
}


exports.editcoupon = async(req, res) =>{
    try {
        const couponId = req.query.id
        const coupon = await Coupon.findOne({_id : couponId})
         res.render("editcoupon",{coupon,title : "Coupon management"})

    } catch (error) {
        
    }
}
exports.updateCoupon = async(req, res) =>{
    try {
        const {id,couponname,minimumPurchase,discount,date} = req.body;
        console.log(id);
        await Coupon.updateOne({_id : id},{
            $set:{
                 couponName : couponname,
                 minimumPurchase : minimumPurchase,
                 maximumDiscount : discount,
                 lastDate : date
            }
        })
        res.redirect('/admin/couponmanagement')
    } catch (error) {
        console.log(error.message);
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
    //  console.log(couponName);
     const cart = await Cart.findOne({userId : user}).populate('products.productId');
     const Total = cart.products.reduce((acc, val)=> acc+val.totalPrice,0);
    //  console.log(Total);
    const couponFound = await Coupon.findOne({couponName});
    // console.log(couponFound);

    const currentDate = new Date()
 
    const usedCoupon = await Coupon.find({couponName, usedUsers: { $in: [user] } })
   if (couponFound===null) {
    console.log(couponFound);
        return res.json({empty : true })
   }else{
    if(couponFound.lastDate < currentDate){
        
        res.json({expired : true})
    }else if(couponFound && usedCoupon.length == 0){
        
        if(Total < couponFound.minimumPurchase){ 
            res.json({applied : false, message : "minimum purchase doesnt match"})
           
        }else{
            // console.log("heyyy");
            await Cart.findOneAndUpdate({userId : user},{$set:{couponApplied:couponName}})
            
            res.json({applied : true,message:'Coupon applied'})
        }
    }
   }
 

    } catch (error) {

        console.log(error.message);
        
    }
}

exports.removecoupon = async(req, res) =>{
    try {
        const userId = req.session.userId
        await Cart.updateOne({userId},{
            $set :{
                couponApplied : ""
            }
        })
        res.redirect('/getcart')
    } catch (error) {
        console.log(error.message);
    }
}


