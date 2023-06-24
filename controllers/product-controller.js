const category = require("../models/categorySchema");
const Product = require("../models/productSchema");
const Swal = require("sweetalert2");
const fs = require("fs");
const { error } = require("console");
const { getCategory } = require("../helpers/product-helpers");

module.exports = {
  getCategoryPage: async (req, res) => {
    try {
      const categories = await category.find({});

      if (categories) {
        res.render("admin/category", { admin: true, categories });
      } else {
        res.status(404).json({ message: error });
      }
    } catch (err) {
      res.status(404).json({ message: err });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const { productId } = req.body;
      console.log(productId);

      // Retrieve the product from the database
      const product = await Product.findById(productId);

      // Delete the product images from the upload folder
      await product.ProductImages.forEach((image) => {
        const imagePath = `public/uploads/product_images/${image}`;
        fs.unlinkSync(imagePath);
      });
      await Product.findByIdAndDelete(productId).then(() => {
        res.status(200).json({ message: "deleted" });
      });
    } catch (error) {
      console.error(error);
    }
  },

  getEditCategoryPage: async (req, res) => {
    try {
      const { categoryId } = req.query;

      await getCategory(categoryId)
        .then((selectedCategory) => {
          res.render("admin/edit-category", { admin: true, selectedCategory });
        })
        .catch((err) => {
          console.log("Categories not getting " + err);
        });
    } catch (err) {
      res.status(500).json({ message: err });
    }
  },

  editCategoryName: async (req, res) => {
    try {
      const { category_name } = req.body;

      const { categoryId } = req.query;
      getCategory(categoryId).then(async (category) => {
        console.log(category);
        if (!category) {
          res.status(500).json({ error: "Category not found" });
        }
        //update category name
        category.CategoryName = category_name;
        await category.save();

        res.redirect("/admin/category");
      });
    } catch (err) {
      console.error("Error editing category name:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteCategory:async (req, res) => {

    try{
      const {categoryId} = req.body

      await category.findByIdAndDelete(categoryId).then((sucess)=>{
        if(sucess){
          console.log(sucess);
       res.json({message:sucess})
        }else{
          res.status(404).json({message:'not found'})
        }
      })

      
    }catch(error){

      res.status(404).json({error:"Error occurs in category deleting "})

    }


  },
};
