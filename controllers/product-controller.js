const category = require("../models/categorySchema");
const Product = require("../models/productSchema");


module.exports={

    getCategoryPage:(req,res)=>{

        res.render('admin/category',{admin:true})

    }



}