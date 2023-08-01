const User = require("../models/userSchema");
module.exports={

        authenticateSession:(req,res,next)=>{
            try {
             
                
                if(req.session.user){
                   next()
                }else{     
            res.redirect('/login')
                }
            } catch (error) {
                console.log(error);
                res.render('error',{message:error})
                
            }
      
    },
authenticateAdmin:((req,res,next)=>{ 

    try {
        if(req.session.admin){
            next()
        }else{
    
            res.redirect('/admin/admin-login')
        }
        
    } catch (error) {
        res.render('error',{message:error})

        
    }

   
}),
authenticateForLogin:((req,res,next)=>{
    try {
        if(req.session.admin){
            res.redirect('/admin')
        }else{
            next()
        }
    } catch (error) {
        res.render('error',{message:error})

    }
    
}),

authenticateForUser:async(req,res,next)=>{
 try {
    const phone = req.session.user.phone

    const user = await User.findOne({phone:phone})
 
     if(user.isActive){
         next()
     }else{
         res.render('user/login',{u:false})
     }
    
 } catch (error) {
    
    rres.render('error',{message:error})
 }

  
},


    
}