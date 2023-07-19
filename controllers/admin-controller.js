const User = require("../models/userSchema");
const mongoose = require("mongoose");
const category = require("../models/categorySchema");
const Product = require("../models/productSchema");
const Order = require('../models/orderSchema')
const Admin = require('../models/adminSchema')
const bcrypt = require('bcrypt')
const sharp = require("sharp");
const { error } = require("jquery");
const {fetchDailySaleReport,
  fetchWeeklySaleReport,
  fetchYearlySaleReport,
  GetUserCount,GetOrderCount,
  GetProductsCount,
  GetTotalRevenue,
  GetMonthlyTotalOrderCount,
  GetMonthlyTotalPlacedOrderCount,
  GetMontlyTotalPendingOrderCount} = require('../helpers/admin-helpers')






module.exports = {


  getLoginPage: (req, res) => {
    res.render("admin/admin-login", { admin_login: true ,loggedErr:false});
  },

        loginAdmin:async(req,res)=>{

          try{
            const{UserName,password}= req.body

            const admin =await Admin.findOne({Username:UserName})

              if(!admin){
                const  passwordErr='invalid password'
                const  userNameErr='invalid username'
              res.render('admin/admin-login',{userNameErr,admin_login:true,loggedErr:true})
              }
              else{
                const passwordMatch =await  bcrypt.compare(password,admin.Password)

                if(passwordMatch){
                  req.session.admin=true
                return res.redirect('/admin')
                }else{
                  const  passwordErr='invalid password'
                  const  userNameErr='invalid username'
                res.render('admin/admin-login',{passwordErr,admin_login:true,loggedErr:true})
                
                }
              }
      
          }catch(err){
            console.error('Error finding admin:', err);
          res.status(500).json({ error: 'Internal server error' +err});

          }   
      },
      logoutAdmin:(req,res)=>{
 
        if(req.session.admin){

          req.session.destroy((err)=>{
            res.redirect('/admin/admin-login')
          })
        }

      },
      getDashBoardPage: async (req, res) => {
        try {
          const userCount = await GetUserCount();
          const orderCount = await GetOrderCount();
          const productsCount = await GetProductsCount();
          const totalRevenue = await GetTotalRevenue();
          const total = totalRevenue[0];
          const  response = await GetMonthlyTotalOrderCount()
          const {months,monthlyTotalOrderCount} = response
           const result = await GetMonthlyTotalPlacedOrderCount()
     const{monthlyTotalPlacedCount} = result
     const monthlyTotalPendingCount = await GetMontlyTotalPendingOrderCount()

      
          res.render("admin/dashboard", { admin: true, userCount, orderCount, productsCount, total ,months,monthlyTotalOrderCount ,monthlyTotalPlacedCount,monthlyTotalPendingCount});
        } catch (error) {
          // Handle the error
          console.log(error);
          res.status(500).send("Internal Server Error");
        }
      }
      
,
  findUser_info: async (req, res) => {
    const users = await User.find({});
    console.log(users);
    res.render("admin/user-manage", { admin: true, users });
  },

  changeUserStatus: async (req, res) => {
    try {
      const { userId, action } = req.body;
 
      const user = await User.findOne({ _id: userId });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      console.log(req.session);
      if (user.isActive === true && action === "block") {
        user.isActive = false; 
        // req.session.user=null
       
      } else if (user.isActive === false && action === "unblock") {
        user.isActive = true;
        // req.session.user=user
      
      
      }
      await user.save();
      res.json({ user });
    } catch (err) {
      res.status(500).json({ err: "Internal server error" });
    }
  },
  getSalesReportPage:(req,res)=>{
    res.render('admin/sales-report',{admin:true})
  },
  fetchingSalesReport:(req,res)=>{

    if(req.body.btn==='daily'){

      const{Date} = req.body 
      
      fetchDailySaleReport(Date).then((response)=>{
        const{dailyReports,TotalAmount} =response
        console.log(dailyReports);
        console.log("Total",TotalAmount[0]);
        const Total =TotalAmount[0]
        res.status(200).json({message:'success',dailyReports,Total})
       
      }).catch((err)=>{
        res.status(400).json({error:err})
      })
    }else if(req.body.btn==='weekly'){

      const{Date} = req.body
      fetchWeeklySaleReport(Date).then((response)=>{
        const{weeklyReports,TotalAmount} =response
        const Total= TotalAmount[0]
        res.status(200).json({message:'success',weeklyReports,Total})

      }).catch((err)=>{
        res.status(400).json({error:err})

      })

    }
    else if(req.body.btn ==='yearly'){
      const{Year} = req.body
      fetchYearlySaleReport(Year).then((response)=>{
        const{yearlyReports,TotalAmount} = response
        const Total = TotalAmount[0]
        res.status(200).json({message:'success',yearlyReports,Total})

      }).catch((err)=>{
        res.status(400).json({error:err})

      })
    }

  }

 
};
