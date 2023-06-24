
module.exports={

    authenticateSession:(req,res,next)=>{
        console.log('1');
        console.log(req.session);
        if(req.session.user){
           next()
        }else{
            console.log('3');
            res.render('user/login',{u:false})
        }
    },
authenticateAdmin:((req,res,next)=>{
    console.log('nimi');
    if(req.session.admin){
        console.log('sha');
        next()
    }else{
        console.log("ps");
        res.redirect('/admin/admin-login')
    }
}),
authenticateForLogin:((req,res,next)=>{
    if(req.session.admin){
        res.redirect('/admin')
    }else{
        next()
    }
})

   
     
      
      

    
}