const mongoose = require('mongoose')
const Order = require('../models/orderSchema')
const User = require('../models/userSchema')
const Product = require('../models/productSchema')
const moment = require('moment')
const Wallet = require('../models/walletSchema')

module.exports={
    fetchAllPlacedOrder:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                const sucessOrders = await Order.aggregate([{
                   $unwind:'$Products'
                },{
                    $match:{
                        'Products.Status':'Delivered'
                    }
                }])

                sucessOrders.forEach((order) => {
                    order.createdAt = moment(order.createdAt).format('YYYY-MM-DD');
                  });
                
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
                    'Products.Status':'Delivered'
                }
            }
           
            ])
            const TotalAmount  = await Order.aggregate([
                {
                    $match:{
                        createdAt:{
                            $gte: new Date(date),
                            $lt : new Date(date+ 'T23:59:59Z')
                        },'Products.Status':'Delivered'
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
                // Format the createdAt date using moment
      dailyReports.forEach((report) => {
        report.createdAt = moment(report.createdAt).format('YYYY-MM-DD');
      });

            
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
                },'Products.Status':'Delivered'
            }
        }, {
                $unwind:'$Products'
            },
            {
                $match:{
                    'Products.Status':'Delivered'
                }
            }
        
            ])

            const TotalAmount  = await Order.aggregate([
                {
                    $match:{
                        createdAt:{
                            $gte: startDate,
                            $lt :endDate
                        },'Products.Status':'Delivered'
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
            weeklyReports.forEach((report) => {
                report.createdAt = moment(report.createdAt).format('YYYY-MM-DD');
              });

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
                        'Products.Status':'Delivered'
                    }
                },
                {
                    $unwind:'$Products'
                },
                {
                    $match:{
                        'Products.Status' :'Delivered'
                    }
                }

            ])
            const TotalAmount  = await Order.aggregate([
                {
                    $match:{
                        createdAt:{
                            $gte: new Date(`${year}-01-01`),
                            $lt : new Date(`${Number(year + 1)}-01-01`)
                        },'Products.Status':'Delivered'
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
            yearlyReports.forEach((report) => {
                report.createdAt = moment(report.createdAt).format('YYYY-MM-DD');
              });
            
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
                            TotalRevenue:{
                                $sum:'$TotalAmount'
                            }
                        }
                    }
  
                ])

                if(TotalRevenue.length===0){
                    resolve({TotalRevenue:0})
                }else{

                    resolve(TotalRevenue[0])
                }

             
                
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
    },
    fetchOrdersList:()=>{
        return new Promise(async(resolve, reject) => {

            try {
                const ordersList = await Order.find().sort({ createdAt: -1 });

                ordersList.forEach((order) => {
                    order.createdAt = moment(order.createdAt).format('YYYY-MM-DD');
                  });

            if(!ordersList){
                reject(ordersList)
            }
            resolve(ordersList)
                
            } catch (error) {
                console.log(error);

                reject(error)
                
            }
            

        })
    },

    fetchOrderDetailsFromAdmin:(orderId)=>{

        return new Promise(async(resolve,reject)=>{
          try {
    
            const orders =await Order.aggregate([{
              $match:{
                OrderId:orderId
              }
            },{
              $unwind:'$Products'
            },{
              $lookup:{
                from:'products',
                localField:'Products.ProductId',
                foreignField:'_id',
                as:'ProductInfo'
              }
            },
            {
            $lookup:{
                from:'addresses',
                localField:'ShippingAddress',
                foreignField:'_id',
                as:'AddressInfo'
            }
            },{
                $lookup:{
                    from:'users',
                    localField:'CustomerId',
                    foreignField:'_id',
                    as:'UserInfo'
                }

            },
            {
                $unwind:'$ProductInfo'   
            },
            {
                $unwind:'$AddressInfo'
            },
            {
                $unwind:'$UserInfo'

            },
            {
                $project:{
                  _id:null,
                  ProductName:'$Products.ProductName',
                  Quantity:'$Products.Quantity',
                  UnitPrice:'$Products.Price',
                  Price:{$multiply:['$Products.Quantity','$Products.Price']},
                  Status:'$Products.Status',
                  ProductImages:'$ProductInfo.ProductImages',
                  PaymentMethod:'$PaymentMethod',
                  Date:'$createdAt',
                  OrderId:'$OrderId',
                  TotalAmount:'$TotalAmount',
                  ProductId:'$ProductInfo._id',
                  Adress:'$AddressInfo',
                  CustomerName:'$UserInfo.Name',
                  CustomerInfo:'$UserInfo',
                  Reason:'$Products.reasonForCancellation',
                  ProductId:'$Products.ProductId'

                }
              }
  
         ])
         orders.forEach((order) => {
          order.Date = moment(order.Date).format('YYYY-MM-DD');
        });
       
        console.log(orders);
        if(!orders){
          reject('no orders')
    
        }
        resolve(orders)
          } catch (error) {
    
            console.log(error);
            reject(error)
            
          }
        })
      },
      changeOrderItemStatusFromAdmin:(ProductId,OrderId,newStatus,customerId,paymentStatus)=>{
        return new Promise(async(resolve, reject) => {

            try {
                const userOrder = await Order.findOne({CustomerId:customerId,
                OrderId:OrderId})
                const user = await User.findById(customerId)

                
            if(!userOrder){
                reject('no order for this user')
            }

            console.log(ProductId)
            
            console.log(userOrder,'aaaaa');;

            const productToUpdate = userOrder.Products.find(item => item.ProductId.equals(ProductId));
            let Price  = productToUpdate.Price * productToUpdate.Quantity
           
            if (!productToUpdate) {
                return reject('Product not found in the order');
              }          
              if(newStatus==='Returned' || (newStatus==='Cancelled' && paymentStatus==='Razor pay') ){

                const product = await Product.findById(ProductId)
                product.StockQuantity += productToUpdate.Quantity
                  const wallet = await Wallet.findOne({ User: customerId });
                  if(!wallet){
                const  newWallet = new Wallet({
                    User:customerId,
                    Balance:Number(Price),
                  })
                  user.Wallet =Number(Price)

                 await  newWallet.save()
                }else{
                  console.log('order.Price:', Price);
                  wallet.Balance += Number(Price);
                  console.log('wallet.Balance:', wallet.Balance);
                  await wallet.save()
                  user.Wallet = wallet.Balance
                
              }
              await product.save();
            }
              await user.save()
              productToUpdate.Status = newStatus;
              await userOrder.save();
              resolve('Order item status updated successfully');
                
            } catch (error) {
                console.log(error);
                reject(error)
                
            }
            
            
        })
      }


}