const Category = require("../model/catergoryModel");
const Product = require("../model/productModel");

exports.productmanagement = async (req, res) => {
  try {
    const product = await Product.find().populate('category')

    res.render("pmanagement", { admin: req.session.admin, product });
  } catch (error) {
    console.log(error.message);
  }
};

exports.showAddProduct = async (req, res) => {
  try {
    const category = await Category.find();

    res.render("addproduct", { category, admin: req.session.admin });
  } catch (error) {}
};

exports.addProduct = async (req, res) => {
  try {

    const { s_no, name, price, stock, description } = req.body;
    const files = await req.files
    

    const products = new Product({
      s_no: s_no,
      name: name,
      category: req.body.category,
      price: price,
      stock: stock,
      "image.image1" : files.image1[0].filename,
      "image.image2" : files.image2[0].filename,
      "image.image3" : files.image3[0].filename,
      "image.image4" : files.image3[0].filename,
      description: description,
    });
    await products.save();
    res.redirect("/admin/productmanagement");
  } catch (error) {
    console.log(error.message);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { s_no, name, category, price, stock, description, id } = req.body
    let imageFiles = req.files
    const data = await Product.findById({_id : id});
   
   let image1 = imageFiles.image1 ? imageFiles.image1[0].filename : data.image.image1;
   let image2 = imageFiles.image2 ? imageFiles.image2[0].filename : data.image.image2;
   let image3 = imageFiles.image3 ? imageFiles.image3[0].filename : data.image.image3;
   let image4 = imageFiles.image4 ? imageFiles.image4[0].filename : data.image.image4;
    await Product.findByIdAndUpdate({
     _id :  id},
      {
        $set: {
          s_no: s_no,
          name: name,
          category: category,
          price: price,
          stock: stock,
          description: description,
          "image.image1" : image1,
          "image.image2" : image2,
          "image.image3" : image3,
          "image.image4" : image4
        }
      }
    );

    res.redirect("/admin/productmanagement");
  } catch (error) {
    console.error(error.message);

  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const id = req.query.id;
      const blocked = await  Product.findById({_id : id}) 
    
      if(!blocked.is_blocked){
        await Product.findByIdAndUpdate({_id : id},{$set :{
          is_blocked : true
     }})
 
      }else{

        await Product.findByIdAndUpdate({_id : id},{$set :{
          is_blocked : false
     }})
        
      }
   
    res.redirect("/admin/productmanagement");
  } catch (error) {
    console.error(error.message);
  }
};
