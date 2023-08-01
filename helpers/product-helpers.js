const category = require("../models/categorySchema");
const Product = require("../models/productSchema");
module.exports = {
  getCategory: (categoryId) => {
    return new Promise(async (resolve, reject) => {
      await category
        .findById(categoryId).then((selectedCategory) => {
          resolve(selectedCategory);
        })
        .catch((err) => {reject(err);
        });
    });
  },

  findCategory:()=>{
    return new Promise(async(resolve,reject)=>{
      await category.find({}).then((categories)=>{
        resolve(categories)
      }).catch((err)=>{
        reject(err)
      })

    })

  },


  changeStockCount:(productId,stockQuantity)=>{

    return new Promise(async(resolve, reject) => {
      try {


        const product = await  Product.findById(productId)

        if(!product){
          reject('no product')
        }

        product.StockQuantity =stockQuantity

        await product.save()
        resolve('stock update successfully')

      } catch (error) {
console.log(error);
        reject(error)
        
      }
    })
  }
};
