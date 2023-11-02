const Offer = require('../model/offerModel');
const Category = require('../model/catergoryModel')

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