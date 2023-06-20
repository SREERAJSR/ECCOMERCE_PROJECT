var express = require("express");
var router = express.Router();
const {findUser_info,changeUserStatus} = require('../controllers/admin-controller')

router.get('/',(req,res)=>{

    res.render('admin/list-users',{admin:true})

})


router.get('/user-manage',findUser_info)

router.patch('/userManage',changeUserStatus)

module.exports = router;
