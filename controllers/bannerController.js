const banner = require('../model/bannerModel');

exports.banner = async(req, res) =>{
    try {
    
        res.render('banner',{title : "banner management"})
    } catch (error) {
        console.log(error.message);
    }
}

exports.addBanner = async(req, res) =>{
    try {
        res.render('addbanner',{title : "banner management"})
    } catch (error) {
        console.log(error.message);
    }
}