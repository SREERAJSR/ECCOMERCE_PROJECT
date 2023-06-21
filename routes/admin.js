    var express = require("express");
    var router = express.Router();
    const {findUser_info,changeUserStatus,
        getaddProducts,addingProducts,insertCategoryName
        ,getListProductPage,getEditProductPage,
        editProductAndSave,deleteProduct} = require('../controllers/admin-controller')

        const {getCategoryPage} = require('../controllers/product-controller')


    // const upload = require("../middlewares/multer-config")
    const multer = require('multer')
   const upload = require('../middlewares/multer-config')


    router.get('/',(req,res)=>{

        res.render('admin/list-users',{admin:true})

    })


    router.get('/user-manage',findUser_info)

    router.patch('/userManage',changeUserStatus)

    router.get('/add-product',getaddProducts)

    router.post('/add-product',upload.array('images',4),addingProducts)

    router.post('/add-category',insertCategoryName)

    router.get('/category',getCategoryPage)





    router.get('/list-products',getListProductPage)
  
    router.get('/edit-product',getEditProductPage)

    router.post('/edit-product',upload.array('images',4),editProductAndSave)

    router.delete('/delete-product',deleteProduct)

    

    module.exports = router;
