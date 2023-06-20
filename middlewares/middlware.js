module.exports={

    authenticateSession:(req,res,next)=>{
        console.log('1');
        if(req.session.user){
            console.log('2');
            next()
        }else{
            console.log('3');
            res.redirect('/login')
        }
    }
}