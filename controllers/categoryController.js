const Category = require("../model/catergoryModel");
const Sharp = require("sharp");
const fs = require("fs");
const path = require("path");

exports.categorymanagement = async (req, res) => {
  try {
    const category = await Category.find({});
    res.render("category", { category, admin: req.session.admin });
  } catch (error) {
    console.log(error.message);
  }
};

exports.addcategory = async (req, res) => {
  try {
    const { cat } = req.body;
  
    let isFound = await Category.findOne({ name: cat });
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

exports.editCategory = async (req, res) => {
  try {
    let cId = req.query.id;
    let cinfo = await Category.findById({ _id: cId });
    res.render("editcategory", { cinfo });
  } catch (error) {
    console.log(error.message);
  }
};

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

exports.unblockCategory = async (req, res) => {
  try {
    const Id = req.query.id;
    await Category.findByIdAndUpdate(Id, { Blocked: false });
    res.redirect("/admin/categorymanagement");
  } catch (error) {
    console.log(error.message);
  }
};
