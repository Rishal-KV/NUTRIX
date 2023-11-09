const Offer = require('../model/offerModel');
const Category = require('../model/catergoryModel');
const { updateOne } = require('../model/userModel');

//======================rendering offer mgt page====================

exports.offer = async(req, res) =>{
    try {
        const offer = await Offer.find();
        res.render('offer',{title : "Offer management",offer})
    } catch (error) {
        console.log(error.message);
    }
}

//========================adding offer================================

exports.addOffer = async(req, res) =>{
    try {
        let category = await Category.find()
        res.render('addoffer',{title :"Offer management",category})
    } catch (error) {
        console.log(error.message);
    }
}


//=====================offer add post====================================
exports.offerAdd = async(req, res) =>{
    try {
        let {name,activationdate,expiredate,amount,category} = req.body
        const OFFER = new Offer({
            name : name,
            activationDate : activationdate,
            expiryDate : expiredate,
            discountAmount : amount
        })
       const offer = OFFER.save();

       let offerId = (await offer)._id

       //adding category name to offer
       await  Offer.findOneAndUpdate({_id : offerId},{
        $set :{
            category : category
        }
       })
       
       //setting offer to category
       let addOffer = await  Category.findOneAndUpdate({name : category},{
        $set :{
            offer : offerId
        }
       })
  
         res.redirect('/admin/offermanagement')
    } catch (error) {
        console.log(error.message);
    }
}



//================================offer edit get=================================================================
exports.editoffer = async(req, res) =>{
    try {
        let offerId = req.query.id;
        const category = await  Category.find()
        const offer = await Offer.findOne({_id : offerId})
        res.render('editoffer',{offer,title : "Offer management",category})
    } catch (error) {
        console.log(error.message);
    }
}

exports.updateOffer = async(req, res) =>{
    try {
      const offerId = req.body.id;
      const {name,discountAmount,expiryDate,category} = req.body
      const updateOffer = await Offer.findByIdAndUpdate({_id : offerId},{
        name : name,
        discountAmount : discountAmount,
        expiredate : expiryDate,
        category : category
      })  
      res.redirect('/admin/offermanagement')
    } catch (error) {
        console.log(error.message);
    }
}


exports.updateStatus = async(req, res) =>{
    try {
        let offerId = req.query.id;
    
        const block = await Offer.findOne({_id : offerId});
        if(block.is_blocked){
           await Offer.updateOne({_id : offerId},{
            is_blocked : false
           })
           res.redirect('/admin/offermanagement')
        }else{
            await Offer.updateOne({_id : offerId},{
                is_blocked : true
               })
               res.redirect('/admin/offermanagement')
        }
    } catch (error) {
        console.log(error.message);
    }
}