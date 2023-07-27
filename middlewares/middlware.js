const User = require("../models/userSchema");
module.exports={

        authenticateSession:(req,res,next)=>{
        console.log('1');
        console.log(req.session);
        if(req.session.user){
            console.log(376);
           next()
        }else{
         
       
    res.redirect('/login')
        }
    },
authenticateAdmin:((req,res,next)=>{ 

    if(req.session.admin){
        next()
    }else{

        res.redirect('/admin/admin-login')
    }
}),
authenticateForLogin:((req,res,next)=>{
    if(req.session.admin){
        res.redirect('/admin')
    }else{
        next()
    }
}),

authenticateForUser:async(req,res,next)=>{
    console.log(req.session);

   const phone = req.session.user.phone

   const user = await User.findOne({phone:phone})

    if(user.isActive){
        next()
    }else{
        res.render('user/login',{u:false})
    }
},


    
}