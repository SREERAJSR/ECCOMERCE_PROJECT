const User = require("../models/userSchema");
const mongoose = require("mongoose");
const category = require("../models/categorySchema");
const Product = require("../models/productSchema");
const Admin = require('../models/adminSchema')
const bcrypt = require('bcrypt')


module.exports = {


  getLoginPage: (req, res) => {
    res.render("admin/admin-login", { admin_login: true });
  },

    loginAdmin:async(req,res)=>{

      try{
        const{UserName,password}= req.body

        const admin =await Admin.findOne({Username:UserName})

          if(!admin){
           return res.status(404).json({error:'not found using this username'})
          }
          else{
            bcrypt.compare(password,admin.Password,(err,result)=>{

              if(err){
                ////////not working
                  // Error occurred during password comparison
             console.error('Error comparing passwords:', err);
           res.status(500).json({ error: 'Internal server error' });
              }

              if(result){
                res.redirect('/admin')
              }
            })
          }
  
      }catch(err){
        console.error('Error finding admin:', error);
      res.status(500).json({ error: 'Internal server error' });

      }

     

    },

  findUser_info: async (req, res) => {
    const users = await User.find({});
    console.log(users);
    res.render("admin/user-manage", { admin: true, users });
  },

  changeUserStatus: async (req, res) => {
    try {
      const { userId, action } = req.body;

      console.log(req.body);
      const user = await User.findOne({ _id: userId });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (user.isActive === true && action === "block") {
        user.isActive = false;
      } else if (user.isActive === false && action === "unblock") {
        user.isActive = true;
      }
      await user.save();
      res.json({ user });
    } catch (err) {
      res.status(500).json({ err: "Internal server error" });
    }
  },

  getaddProducts: (req, res) => {
    res.render("admin/add-product", { admin: true });
  },
  insertCategoryName: async (req, res) => {
    try {
      const { categoryName } = req.body;
      // if existing category is there
      const existingcategory = await category.findOne({
        CategoryName: { $regex: new RegExp(`^${categoryName}$`, "i") },
      });
      if (existingcategory) {
        return res.status(400).json({ error: "Category name already exists" });
      }

      const newCategory = new category({
        CategoryName: categoryName,
      });
      await newCategory
        .save()
        .then(() => {
          res.redirect("/admin/category");
        })
        .catch((err) => {
          console.log("category upload error" + err);
        });
    } catch {
      return res.status(400).json({ error: "Category uploaded error" });
    }
  },

  addingProducts: async (req, res) => {
    try {
      console.log(req.files);
      console.log(req.body);
      const {
        product_name,
        brand_name,
        description,
        screen_size,
        memory_size,
        category_name,
        stock_quantity,
        regular_price,
        sale_price,
      } = req.body;
      const productImagesFileName = req.files.map((file) => file.filename);

      //  const{originalname} = req.files
      const Dbcategory = await category.findOne({
        CategoryName: category_name,
      });
      console.log(Dbcategory);

      const newProduct = await new Product({
        ProductName: product_name,
        BrandName: brand_name,
        Description: description,
        ScreenSize: screen_size,
        MemorySize: memory_size,

        Category: {
          categoryId: Dbcategory._id,
          categoryName: category_name,
        },
        StockQuantity: stock_quantity,
        RegularPrice: regular_price,
        SalePrice: sale_price,
        ProductImages: productImagesFileName,
      });
      await newProduct.save().then(() => {
        console.log("sucessfull product added");
        res.redirect("/admin/list-products");
      });
    } catch (err) {
      res.status(400).json({ error: "product uploaded error" + err });
    }
  },

  getListProductPage: async (req, res) => {
    try {
      const allProducts = await Product.find({});

      res.render("admin/list-products", { admin: true, allProducts });
    } catch {}
  },
  getEditProductPage: async (req, res) => {
    try {
      const userId = req.query.productId;
      const product = await Product.findOne({ _id: userId });
      res.render("admin/edit-product", { admin: true, product });
    } catch (err) {
      res.status(400).json({ error: "product uploaded error" + err });
    }
  },
  editProductAndSave: async (req, res) => {
    try {
      const { productId } = req.query;

      console.log(req.body);
      console.log(req.query.productId);

      const {
        product_name,
        brand_name,
        description,
        screen_size,
        memory_size,
        category_name,
        stock_quantity,
        regular_price,
        sale_price,
      } = req.body;

      const productSave = await Product.findByIdAndUpdate(
        productId,
        {
          ProductName: product_name,
          BrandName: brand_name,
          Description: description,
          ScreenSize: screen_size,
          MemorySize: memory_size,
          "Category.categoryName": category_name,
          StockQuantity: stock_quantity,
          RegularPrice: regular_price,
          SalePrice: sale_price,
        },
        { new: true }
      );

      console.log(req.files);
      if (productSave) {
        res.redirect("/admin/list-products");
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update the product" });
    }
  },
};
