const User = require('../models/userSchema')




module.exports={
  findUser_info :async(req,res)=>{
    
    const users= await User.find({})

    console.log(users);

    res.render('admin/user-manage',{admin:true,users})
  },

  changeUserStatus: async (req,res)=>{

    try{
    const{userId,action } = req.body
   const user= await User.findOne({_id:userId})
   if(!user){
    return res.status(404).json({ error: 'User not found' });
   }
   if(user.isActive===true && action ==='block'){
    user.isActive = false
   }else if(user.isActive===false && action ==='unblock'){
    user.isActive=true
   }
   await user.save()
   res.json({ user }); 
    }catch(err){
      res.status(500).json({err:'Internal server error'})

  }

},

getaddProducts :(req,res)=>{

  res.render('admin/add-product',{admin:true})
}
,


addingProducts:(req,res)=>{

  console.log(req.files);
  console.log(req.body);

}

}