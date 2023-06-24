const category = require("../models/categorySchema");
module.exports = {
  getCategory: (categoryId) => {
    return new Promise(async (resolve, reject) => {
      await category
        .findById(categoryId)
        .then((selectedCategory) => {
          resolve(selectedCategory);
        })
        .catch((err) => {
          reject(err);
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


  categoryWiseFiltering:()=>{
    
  }
};
