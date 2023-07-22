const mongoose = require('mongoose')
const Order = require('../models/orderSchema')
const User = require('../models/userSchema')
const Product = require('../models/productSchema')


module.exports={
    fetchAllPlacedOrder:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                const sucessOrders = await Order.aggregate([{
                   $unwind:'$Products'
                },{
                    $match:{
                        'Products.Status':'Placed'
                    }
                }])
                
                resolve(sucessOrders)
            } catch (error) {

                reject(error)
                
            }


        })


    },

    fetchDailySaleReport:(date)=>{

        return new Promise(async(resolve,reject)=>{

            try{

            const dailyReports = await Order.aggregate([
            {
                $match:{
                    createdAt:{

                        $gte: new Date(date),
                        $lt : new Date(date+ 'T23:59:59Z')
                    },
                    'Products.Status':'Placed'
                }
            },
           
            {
                $unwind:'$Products'
            },
            {
                $match:{
                    'Products.Status':'Placed'
                }
            }
           
            ])
            const TotalAmount  = await Order.aggregate([
                {
                    $match:{
                        createdAt:{
                            $gte: new Date(date),
                            $lt : new Date(date+ 'T23:59:59Z')
                        },'Products.Status':'Placed'
                    }
                },
                {
                    $group:{
                        _id:null,
                            Total:{
                                $sum:'$TotalAmount'
                            }  
                    }
                }
            ])
            
            resolve({dailyReports,TotalAmount})
        }catch(error){
            console.log('agggreagation error');
            reject(error)
        }
           
        })
    },
    fetchWeeklySaleReport:(months)=>{

        return new Promise(async(resolve,reject)=>{

            try{
            const[year,month] = months.split('-')
            console.log(year,month);

  // Convert month to number (1-based index)
    const numericMonth = parseInt(month);

    const startDate = new Date(year,numericMonth-1,1);
    const endDate = new Date(year,numericMonth,0);

    console.log(startDate);
    console.log(endDate);
    const weeklyReports = await Order.aggregate([
        {
            $match:{
                createdAt:{

                    $gte: startDate,
                    $lt : endDate
                },'Products.Status':'Placed'
            }
        }, {
                $unwind:'$Products'
            },
            {
                $match:{
                    'Products.Status':'Placed'
                }
            }
        
            ])

            const TotalAmount  = await Order.aggregate([
                {
                    $match:{
                        createdAt:{
                            $gte: startDate,
                            $lt :endDate
                        },'Products.Status':'Placed'
                    }
                },
                {
                    $group:{
                        _id:null,
                            Total:{
                                $sum:'$TotalAmount'
                            }  
                    }
                }
            ])

            console.log('week',weeklyReports);
            console.log('total',TotalAmount);
            resolve({weeklyReports,TotalAmount})
        }catch(err){
            console.log(err);

            reject('aggregation error in weekly report')

        }
        })
    },
    fetchYearlySaleReport:(year)=>{

        return new Promise(async(resolve,reject)=>{

            try{

                

            const yearlyReports = await Order.aggregate([
                {
                    $match:{
                        createdAt:{
                            $gte: new Date(`${year}-01-01`),
                            $lt: new Date(`${Number(year) + 1}-01-01`)
                        },
                        'Products.Status':'Placed'
                    }
                },
                {
                    $unwind:'$Products'
                },
                {
                    $match:{
                        'Products.Status' :'Placed'
                    }
                }

            ])
            const TotalAmount  = await Order.aggregate([
                {
                    $match:{
                        createdAt:{
                            $gte: new Date(`${year}-01-01`),
                            $lt : new Date(`${Number(year + 1)}-01-01`)
                        },'Products.Status':'Placed'
                    }
                },
                {
                    $group:{
                        _id:null,
                            Total:{
                                $sum:'$TotalAmount'
                            }  
                    }
                }
            ])
            
            resolve({yearlyReports,TotalAmount})
        }catch(err){
            reject(err)
        }

        })
     

    },
    GetUserCount:()=>{
        return new Promise(async(resolve,reject)=>{

            try{
                const userCount  = await User.find().count()
                console.log(userCount);

                if(!userCount){
                    reject('no user')
                }else{

                    resolve(userCount)
                }

                
            }catch(err){

                reject(err)


            }


            
        })
    },
    GetOrderCount:()=>{
        return new Promise(async(resolve,reject)=>{
            try{

                const orderCount = await Order.find().count()
                
                if(!orderCount){
                    reject('no orders')
                }
                else{
                    resolve(orderCount)
                }
            }catch(err){

                reject(err)

            }
        })
    },
    GetProductsCount:()=>{
        return new Promise(async(resolve,reject)=>{

            try {
                const productCount = await Product.find().count()

                if(!productCount){
                    reject('no product')

                }else{
                    resolve(productCount)
                }
                
            } catch (error) {

                reject(error)
                
            }
        })
    },
    GetTotalRevenue:()=>{
        return new Promise(async(resolve,reject)=>{

            try {

                const TotalRevenue = await Order.aggregate([{
                    $match:{
                        'Products.Status':'Placed'

                    }},{
                        $unwind:'$Products'
                    },{
                        $match:{
                            'Products.Status':'Placed'
                        }
                    },{
                        $group:{

                            _id:null,
                            TotalRevnue:{
                                $sum:'$TotalAmount'
                            }
                        }
                    }
  
                ])

                resolve(TotalRevenue)

             
                
            } catch (error) {
                reject(error)
                
            }
        })
    },
    GetMonthlyTotalOrderCount:()=>{

        return new Promise(async(resolve,reject)=>{

            try {
                const getMonthlyOrderCounts = await Order.aggregate([
            {
                $group:{
                    _id:{$month:'$createdAt'},
                    totalOrders:{$sum:1}
                }
            },{
                $sort:{_id:1}
            },
            {
                $project: {
                    month: { $concat: [{ $substr: ['$_id', 0, -1] }, ''] },
                    totalOrders: 1
                }
            }
        
        ])
        // Define an array with all the month names
const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  // Initialize an array to hold the monthly order counts
  const monthlyTotalOrderCount = Array(12).fill(0);
  
  // Loop through the result and update the monthly counts array
  getMonthlyOrderCounts.forEach(entry => {
    const monthIndex = entry._id - 1; // Adjust month index since it starts from 1
    monthlyTotalOrderCount[monthIndex] = entry.totalOrders;
  });

  resolve({months,monthlyTotalOrderCount})      
            
            } catch (error) {

                reject(error)
                
            }

        })

    },
    GetMonthlyTotalPlacedOrderCount:()=>{

        return new Promise(async(resolve,reject)=>{

            try {
                const getMonthlyOrderCounts = await Order.aggregate([{
                    
                   $unwind:'$Products'
                },
            {
                $match:{
                    'Products.Status':'Placed'
                }
            },
            {
                $group:{
                    _id:{$month:'$createdAt'},
                    totalOrders:{$sum:1}
                }
            },{
                $sort:{_id:1}
            },
            {
                $project: {
                    month: { $concat: [{ $substr: ['$_id', 0, -1] }, ''] },
                    totalOrders: 1
                }
            }
        
        ])
        // Define an array with all the month names
const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  // Initialize an array to hold the monthly order counts
  const monthlyTotalPlacedCount = Array(12).fill(0);
  
  // Loop through the result and update the monthly counts array
  getMonthlyOrderCounts.forEach(entry => {
    const monthIndex = entry._id - 1; // Adjust month index since it starts from 1
    monthlyTotalPlacedCount[monthIndex] = entry.totalOrders;
  });

  resolve({months,monthlyTotalPlacedCount})      
            
            } catch (error) {

                reject(error)
                
            }

        })

    },
    GetMontlyTotalPendingOrderCount:()=>{

        return new Promise(async(resolve,reject)=>{

            try {
                const getMonthlyOrderCounts = await Order.aggregate([{
                    
                   $unwind:'$Products'
                },
            {
                $match:{
                    'Products.Status':'Pending'
                }
            },
            {
                $group:{
                    _id:{$month:'$createdAt'},
                    totalOrders:{$sum:1}
                }
            },{
                $sort:{_id:1}
            },
            {
                $project: {
                    month: { $concat: [{ $substr: ['$_id', 0, -1] }, ''] },
                    totalOrders: 1
                }
            }
        
        ])
        // Define an array with all the month names
const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  // Initialize an array to hold the monthly order counts
  const monthlyTotalPendingCount = Array(12).fill(0);
  
  // Loop through the result and update the monthly counts array
  getMonthlyOrderCounts.forEach(entry => {
    const monthIndex = entry._id - 1; // Adjust month index since it starts from 1
    monthlyTotalPendingCount[monthIndex] = entry.totalOrders;
  });
  

  resolve(monthlyTotalPendingCount)      
            
            } catch (error) {

                reject(error)
                
            }

        })
    }


}