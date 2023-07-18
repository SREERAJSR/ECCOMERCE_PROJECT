const mongoose = require('mongoose')
const Order = require('../models/orderSchema')


module.exports={


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
    }


}