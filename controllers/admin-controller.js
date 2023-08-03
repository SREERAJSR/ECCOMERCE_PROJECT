const User = require("../models/userSchema");
const mongoose = require("mongoose");
const category = require("../models/categorySchema");
const Product = require("../models/productSchema");
const Order = require('../models/orderSchema')
const Admin = require('../models/adminSchema')
const bcrypt = require('bcrypt')
const sharp = require("sharp");
const { error } = require("jquery");
const {fetchAllPlacedOrder,
  fetchDailySaleReport,
  fetchWeeklySaleReport,
  fetchYearlySaleReport,
  GetUserCount,GetOrderCount,
  GetProductsCount,
  GetTotalRevenue,
  GetMonthlyTotalOrderCount,
  GetMonthlyTotalPlacedOrderCount,
  GetMontlyTotalPendingOrderCount,
  fetchOrdersList,
  fetchOrderDetailsFromAdmin,
  changeOrderItemStatusFromAdmin} = require('../helpers/admin-helpers')

module.exports = {


  getLoginPage: (req, res) => {
    res.render("admin/admin-login", { admin_login: true ,loggedErr:false});
  },



loginAdmin: async (req, res) => {
    try {
        const { UserName, password } = req.body;

        const admin = await Admin.findOne({ Username: UserName });

        if (!admin) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const newAdmin = new Admin({
                Username: UserName,
                Password: hashedPassword
            });

            await newAdmin.save();

            // Successfully created a new admin
            req.session.admin = true;
            res.redirect('/admin/')
        }

        const passwordMatch = await bcrypt.compare(password, admin.Password);
        if (passwordMatch) {
            // Password matches, log in the admin
            req.session.admin = true;
            res.redirect('/admin/')
          }

        // Password doesn't match
        const passwordErr = 'Invalid password';
        const userNameErr = 'Invalid username';
        return res.status(200).render('admin/admin-login', {
            passwordErr,
            admin_login: true,    
            loggedErr: true           
        });
    } catch (error) {
        console.log(error);
        return res.status(500).render('error', { message: error });
    }
}
,
  
      logoutAdmin:(req,res)=>{
 
        if(req.session.admin){

          req.session.destroy((err)=>{
            res.redirect('/admin/admin-login')
          })
        }

      },
      getDashBoardPage: async (req, res) => {
        try {
          console.log('HAI');
            const [userCount, orderCount, productsCount, totalRevenue, response, result, monthlyTotalPendingCount] = await Promise.all([
                GetUserCount(),
                GetOrderCount(),
                GetProductsCount(),
                GetTotalRevenue(),
                GetMonthlyTotalOrderCount(),
                GetMonthlyTotalPlacedOrderCount(),
                GetMontlyTotalPendingOrderCount()
            ]);
            const { months, monthlyTotalOrderCount } = response;
            const { monthlyTotalPlacedCount } = result;
            const total = totalRevenue;
    
            console.log('dd', total);
    
            res.status(200).render("admin/dashboard", {
                admin: true,
                userCount,
                orderCount,
                productsCount,
                total,
                months,
                monthlyTotalOrderCount,
                monthlyTotalPlacedCount,
                monthlyTotalPendingCount
            });
        } catch (error) {
            // Handle the error
            console.log(error);
          res.status(500).render('error',{message:error})
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
  getSalesReportPage:async(req,res)=>{
    try {
       const allSucessOrders = await fetchAllPlacedOrder()
      res.render('admin/sales-report',{admin:true,allSucessOrders})
      
    } catch (error) {
      console.log(error);
      
    }
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

  },
  getAdminOrderListPage:(req,res)=>{

    try{

      if(req.session.admin){ 
        fetchOrdersList().then((ordersList)=>{
    
          res.render('admin/admin-order-list',{admin:true,ordersList})
        }).catch((err)=>{
          res.render('error',{message:err})
        })
      }else{
        res.redirect('/admin/admin-login')
      }
    }catch(err){
      console.log(err);
      res.render('error',{message:err})
    }
  }

  ,
  getAdminOrderDetailPage:async(req,res)=>{

    try {
      if(req.session.admin){

        const{orderId}= req.query

        fetchOrderDetailsFromAdmin(orderId).then((orders)=>{

          
          res.render('admin/admin-order-detail',{admin:true,orders})

        }).catch((err)=>{
          console.log(err);

          res.render('error',{message:err})

          
        })
      }else{
        res.redirect('/admin/admin-login')
      }
      
    } catch (error) {
console.log(error);
      res.render('error',{message:error})
      
    }

  },
  changeOrderItemStatus:async(req,res)=>{
    try {
const{ProductId,OrderId,newStatus,customerId,paymentStatus} = req.body

changeOrderItemStatusFromAdmin(ProductId,OrderId,newStatus,customerId,paymentStatus).then((response)=>{

  console.log(response);

  res.status(200).json({status:true,message:response})
}).catch((err)=>{
  console.log(err);
  res.status(500).json({ status: false, message: err }); // Sending an error response in case of rejection

})
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: false, message: 'An unexpected error occurred.' });

    }
  }

 
};
