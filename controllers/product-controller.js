const category = require("../models/categorySchema");
const Product = require("../models/productSchema");
const Coupon = require('../models/couponSchema')
const Swal = require("sweetalert2");
const sharp = require('sharp')
const fs = require("fs");
const slugify = require('slugify');
const { error, log } = require("console");
const { getCategory } = require("../helpers/product-helpers");
const {findCategory}= require('../helpers/product-helpers');



module.exports = {
  getaddProducts: (req, res) => {
    findCategory().then((categories)=>{
      res.render("admin/add-product", { admin: true ,categories});
    })    
  },addingProducts: async (req, res) => {
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
  
      const productImages = req.files;
  
      //  const{originalname} = req.files
      const Dbcategory = await category.findOne({
        CategoryName: category_name,
      });
      console.log(Dbcategory);
  
      // Generate slugs
      const slug = slugify(product_name, { lower: true });
      const categorySlug = slugify(category_name, { lower: true });
  
      const newProduct = new Product({
        Slug: slug,
        ProductName: product_name,
        BrandName: brand_name,
        Description: description,
        ScreenSize: screen_size,
        MemorySize: memory_size,
        Category: {
          categoryId: Dbcategory._id,
          categoryName: category_name,
          Slug: categorySlug,
        },
        StockQuantity: stock_quantity,
        RegularPrice: regular_price,
        SalePrice: sale_price,
        isActive: true,
      });
  
      await Promise.all(
        productImages.map(async (image) => {
          console.log(image);
          const inputImagePath = image.path;
          const outputImagePath = `public/uploads/product_images/${image.filename}`;
   
          await sharp(inputImagePath)
            .resize(522, 522, { fit: 'inside' })
            .toFile(outputImagePath);
          // Unlink the original image file
          fs.unlinkSync(inputImagePath);
          // Update the product images array with the new filenames
          newProduct.ProductImages.push(image.filename);
        })
      );
  
      await newProduct.save();
      console.log('Successfully added product');
      res.redirect('/admin/list-products');
    } catch (err) {
      console.error('Error uploading product:', err);
      res.status(400).json({ error: 'Failed to upload product.' });
    }
  }
 ,
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
      const product = await Product.findOne({ Slug: userId });
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

        const slug = slugify(product_name,{lower:true})
        const categorySlug = slugify(category_name,{lower:true})

        const productSave = await Product.findByIdAndUpdate(
          productId,
          {
            Slug:slug,
            ProductName: product_name,
            BrandName: brand_name,
            Description: description,
            ScreenSize: screen_size,
            MemorySize: memory_size,
            "Category.categoryName": category_name,
            "Category.Slug":categorySlug,
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
  .resize(522, 522,{fit:'cover'}) // Resize the image if needed
  // .extract({ left: 0, top: 0, width: 300, height: 300 }) // Crop the image (adjust the values accordingly)
  .toFile(outputImagePath)
  .then(async() => {
    console.log('Image cropped and saved successfully');
    const regex = new RegExp('^' + categoryName + '$',"i");
   const existingCategory =  await category.findOne({CategoryName:{$regex:regex}})

   if(existingCategory){
    req.flash('success', ' you have entered  Existing category ');
    res.redirect('/admin/category')

   }else{
    const slug = slugify(categoryName,{lower:true})
    const newCategory   = await new category({
      Slug:slug,
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

            const slug = slugify(category_name,{lower:true})
            //update category name
            category.Slug=slug
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
  getCouponPage:async(req,res)=>{

    try{
      const coupons  = await Coupon.find()
      console.log(coupons)
      res.render('admin/add-coupon',{admin:true,coupons})
    }catch{
      const ServerError='server error'
      res.render('admin/add-coupon',{admin:true,ServerError})

    }

  }
 , 
 addingCoupon:async(req,res)=>{

   console.log(req.body);
   
   const {couponcode, discount,validFromDate,validTillDate,min_amount} = req.body

try{

  const coupon = await Coupon.findOne({ CouponCode: { $regex: '^' + couponcode + '$', $options: 'i' } });

if(coupon){
  const existing='is existing'
  var coupons  = await Coupon.find()

res.render('admin/add-coupon',{admin:true,existing,coupons})
}else{

  const newCoupon  = await new Coupon({
    CouponCode: couponcode,
    Discount:discount,
    ValidFromDate:validFromDate,
    ValidTillDate:validTillDate,
    MinAmount:min_amount

  })
  await newCoupon.save()

  const success=' added succesfully'
  var coupons  = await Coupon.find()


res.render('admin/add-coupon',{admin:true,success,coupons})
  
}
  }catch(error){
    const ServerError='server error'
    var coupons  = await Coupon.find()
    res.render('admin/add-coupon',{admin:true,ServerError,coupons})


  }
  
 }
}