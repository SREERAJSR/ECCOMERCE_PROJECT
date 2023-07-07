const category = require("../models/categorySchema");
const Product = require("../models/productSchema");
const Swal = require("sweetalert2");
const sharp = require('sharp')
const fs = require("fs");
const { error } = require("console");
const { getCategory } = require("../helpers/product-helpers");
const {findCategory}= require('../helpers/product-helpers');



module.exports = {
  getaddProducts: (req, res) => {
    findCategory().then((categories)=>{
      res.render("admin/add-product", { admin: true ,categories});
    })

    
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
        isActive:true
      });
      await newProduct.save().then(() => {
        console.log("sucessfull product added");
        res.redirect("/admin/list-products");
      }).catch((err)=>{
        console.log(err);
      })
    } catch (err) {
      res.status(400).json({ error: "product uploaded error" + err });
    }
  },
  getListProductPage: async (req, res) => {
    try {
      const allProducts = await Product.aggregate([{$match:{isActive:true}}])
      // const allProducts = await Product.find()

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
      const productImagesFileName = req.files.map((file) => file.filename);


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
          ProductImages:productImagesFileName
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
  getCategoryPage: async (req, res) => {
    try {
      const categories = await category.aggregate([{$match:{isActive:true}}]);

      if (categories) {
        res.render("admin/category", { admin: true, categories });
      } else {
        res.status(404).json({ message: error }); 
      }
    } catch (err) {
      res.status(404).json({ message: err });
    }
  },
  insertCategoryName: async (req, res ,next) => {
    try {
      const { categoryName } = req.body;
      const image = req.file
      console.log(image);
      const inputImagePath = req.file.path
      const outputImagePath = 'public/uploads/Cropped_CategoryImages/'+req.file.filename

   await  sharp(inputImagePath)
  .resize(500, 500) // Resize the image if needed
  .extract({ left: 0, top: 0, width: 300, height: 300 }) // Crop the image (adjust the values accordingly)
  .toFile(outputImagePath)
  .then(async() => {
    console.log('Image cropped and saved successfully');
    const regex = new RegExp('^' + categoryName + '$',"i");
   const existingCategory =  await category.findOne({CategoryName:{$regex:regex}})

   if(existingCategory){
    req.flash('success', ' you have entered  Existing category ');
    res.redirect('/admin/category')

   }else{
    const newCategory   = await new category({
      CategoryName :categoryName,
      CategoryImage :req.file.filename,
      isActive:true
    })
   await newCategory.save()

   req.flash('success', ' successfully added category ');
   res.redirect('/admin/category')
   }
    

  }).catch((err)=>{
    console.log("image not cropped"+err);
  }) 
       } catch (error){
        console.log(error);
        res.status(500).render('error', { error: error.message });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const { productId } = req.body;
      console.log(productId);

      // Retrieve the product from the database
      const product = await Product.findByIdAndUpdate(productId,{isActive:false},{new:true});

      if(product){
        res.status(200).json({ message: "deleted" });

      }   
    } catch (error) {
      console.error(error);
    }
  },
  getUnlistProductPage:async(req,res)=>{

    try{

      const unlistedProducts = await Product.aggregate([{$match:{isActive:false}}])

      console.log(unlistedProducts);
      res.render('admin/unlist-products',{unlistedProducts,admin:true})
    }catch{

      res.status(500).json({ error: "Internal server error" });

    }
  },
  changeProductStatus:async(req,res)=>{
    try {
      const { productId, action } = req.body;
      console.log(productId, action);
  
      const foundproduct = await Product.findOne({ _id: productId});
      console.log(foundproduct);
      if (!foundproduct) {
        return res.status(404).json({ error: " product not found" });
      }
  
      console.log(foundproduct);
  
      if (foundproduct.isActive === true && action === "block") {
        foundproduct.isActive = false;
        // req.session.user=null
  
      } else if (foundproduct.isActive === false && action === "unblock") {
        foundproduct.isActive = true;
        // req.session.user=user
      }
      await foundproduct.save();
      res.json({ category: foundproduct});
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }


  },

  getEditCategoryPage: async (req, res) => {
    try {
      const { categoryId } = req.query;

      await getCategory(categoryId)
        .then((selectedCategory) => {
          console.log(selectedCategory);
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
        const regex = new RegExp(`^${category_name}$`, "i"); 
        console.log(req.file); 
        const existingCategory = await category.findOne({ CategoryName: { $regex: regex } }).exec();
        if (existingCategory) {
          req.flash('success', '  existing category');
          res.redirect('/admin/category');
        }else{
          const image = req.file
          console.log(image);
          const inputImagePath = req.file.path
          const outputImagePath = 'public/uploads/Cropped_CategoryImages/'+req.file.filename
      await  sharp(inputImagePath)
      .resize(1000, 1000) // Resize the image if needed
      .extract({ left: 0, top: 0, width: 300, height: 300 }) // Crop the image (adjust the values accordingly)
      .toFile(outputImagePath)
      .then(async() => {
      console.log('Image cropped and saved successfully');
          getCategory(categoryId).then(async (category) => {
            console.log(category);
            if (!category) {
              res.status(500).json({ error: "Category not found" });
            }
            //update category name
            category.CategoryName = category_name;
            category.CategoryImage = image.filename
            await category.save();   


            req.flash('success', ' successfully updated category');
            res.redirect("/admin/category");        
        })
      })
        }
      } catch (err) {
        console.error("Error editing category name:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    } 
  ,
  
  deleteCategory:async (req, res) => {

    try{
      const {categoryId} = req.body

    const updatedCategory =  await category.findByIdAndUpdate(categoryId,{isActive:false} ,{new:true})

        if(updatedCategory){
          console.log(sucess);
       res.json({message:sucess})
        }else{
          res.status(404).json({message:'not found'})
        }   
    }catch(error){

      res.status(404).json({error:"Error occurs in category deleting "})

    }


  },
  getUnlistedPage:async(req,res)=>{
    try{
      const unlistedcategories = await category.aggregate([{$match:{isActive:false}}])
        res.render('admin/unlisted-category',{admin:true,unlistedcategories})
    }catch{
      res.status(500).json({ message: err });
    }
  },
  changeCategoryStatus: async (req, res) => {
    try {
      const { categoryId, action } = req.body;
      console.log(categoryId, action);
  
      const foundCategory = await category.findOne({ _id: categoryId });
      console.log(foundCategory);
      if (!foundCategory) {
        return res.status(404).json({ error: "Category not found" });
      }
  
      console.log(foundCategory);
  
      if (foundCategory.isActive === true && action === "block") {
        foundCategory.isActive = false;
        // req.session.user=null
  
      } else if (foundCategory.isActive === false && action === "unblock") {
        foundCategory.isActive = true;
        // req.session.user=user
      }
      await foundCategory.save();
      res.json({ category: foundCategory });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
  
  
};
