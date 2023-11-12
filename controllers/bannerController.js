const Banner = require('../model/bannerModel');

exports.banner = async(req, res) =>{
    try {
        const bannerData = await Banner.find();
        res.render('banner',{title : "banner management",bannerData,admin : req.session.admin})
    } catch (error) {
        console.log(error.message);
    }
}

exports.addBanner = async(req, res) =>{
    try {
      
        res.render('addbanner',{title : "banner management",admin : req.session.admin})
    } catch (error) {
        console.log(error.message);
    }
}


exports.uploadBanner = async(req, res) =>{
    try {
        const {title,image} = req.body
        const banner = new Banner({
           title : title,
           image : req.file.filename
        })
        banner.save();
    res.redirect('/admin/addbanner')
    } catch (error) {
        console.log(error.message);
    }
}

exports.action = async(req, res) =>{
    try {
        const id = req.query.id;
        const status = await Banner.findOne({_id : id});
        // console.log(status);
             if(status.status == false){
                await Banner.updateOne({
                    _id : id
                },{
                    $set :{
                        status : true
                    }
                })
                res.redirect('/admin/bannermanagement')
             }else{
                await Banner.updateOne({
                    _id : id
                },{
                    $set :{
                        status : false
                    }
                })
                res.redirect('/admin/bannermanagement')
             }
    } catch (error) {
        console.log(error.message);
    }
}

exports.editBanner = async(req, res) =>{
    try {
        const id = req.query.id;
        const banner = await Banner.findOne({_id : id});
        res.render('editbanner',{title : "Banner management",banner,admin:req.session.admin})
    } catch (error) {
        console.log(error.message);
    }
}
exports.update = async(req, res) =>{
    try {
        // console.log(req.file);

        const {id,title} = req.body
   
        const updateData = req.file
        ? {
            title: title,
            image: req.file.filename
          }
        : {
            title: title
          };
          const update = await Banner.updateOne({ _id: id }, { $set: updateData });    
       if (update) {
        res.redirect('/admin/bannermanagement')
       }else{
        console.log("not updated");
       }
    } catch (error) {
        console.log(error.message);
    }
}