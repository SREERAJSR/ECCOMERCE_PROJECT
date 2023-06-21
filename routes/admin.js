    var express = require("express");
    var router = express.Router();
    const {findUser_info,changeUserStatus,getaddProducts,addingProducts} = require('../controllers/admin-controller')
    // const upload = require("../middlewares/multer-config")
    const multer = require('multer')
    const upload = multer({ dest: 'uploads/' })


    router.get('/',(req,res)=>{

        res.render('admin/list-users',{admin:true})

    })


    router.get('/user-manage',findUser_info)

    router.patch('/userManage',changeUserStatus)

    router.get('/add-product',getaddProducts)

    router.post('/add-product',upload.array('images',3),addingProducts)

    module.exports = router;
