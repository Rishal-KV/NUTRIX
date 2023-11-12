const Category = require("../model/catergoryModel");



//======================categoryy mgt=======================
exports.categorymanagement = async (req, res) => {
  try {
    const category = await Category.find({});
    res.render("category", { category, admin: req.session.admin,title : "category management" });
  } catch (error) {
    console.log(error.message);
  }
};


//=======================add category ========================
exports.addcategory = async (req, res) => {
  try {
    const { cat } = req.body;
  
    let isFound = await Category.findOne({name:{$regex: new RegExp(cat,'i')}});
    if (isFound) {
      res.redirect("/admin/categorymanagement");
    } else {
        const category = new Category({
            name: cat,
            Blocked: false,
          });
      await category.save();
    
      res.redirect("/admin/categorymanagement");
    }
  } catch (error) {
    console.log(error.message);
  }
};


//========================Edit category============================
exports.editCategory = async (req, res) => {
  try {
    let cId = req.query.id;
    let cinfo = await Category.findById({ _id: cId });
    res.render("editcategory", { cinfo,title : "Category management",admin : req.session.admin});
  } catch (error) {
    console.log(error.message);
  }
};


//======================update category==============================
exports.updateCategory = async (req, res) => {
  try {
    const id = req.body.id;
    const { name } = req.body;
    await Category.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          name: name,
        },
      }
    );
    res.redirect("/admin/categorymanagement");
  } catch (error) {
    console.log(error.message);
  }
};

//======================Block category================
exports.blockCategory = async (req, res) => {
  try {
    const Id = req.query.id;
    console.log(Id);
    await Category.updateOne({ _id: Id }, { $set: { Blocked: true } });

    res.redirect("/admin/categorymanagement");
  } catch (error) {
    console.log(error.message);
    res.render("error");
  }
};


//======================Unblock category================
exports.unblockCategory = async (req, res) => {
  try {
    const Id = req.query.id;
    await Category.findByIdAndUpdate(Id, { Blocked: false });
    res.redirect("/admin/categorymanagement");
  } catch (error) {
    console.log(error.message);
  }
};
