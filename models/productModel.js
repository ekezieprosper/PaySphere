const mongoose = require("mongoose")
const date = new Date().toLocaleString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
const createdOn = `${date}`



const productSchema = new mongoose.Schema({


    productName: {
        type: String,
        required: [true, 'Enter the name of the product'],
    },

    owner: {                
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },

    description: {
        type: String,
        required: [true, 'Please add a description of the product'],
      },

    availableStock: {
        type: Number 
    }, 
    
    productImage: [{
          type: String,
        }],

    price: {
        type: Number,
        required: [true, 'input the price of the product'],
      },

    sellingPrice: {
      type: Number,
        required: [true, 'input the selling price of the product'],
    },

    category: {
        type: String,
        required: [true, 'what category does your product falls under?'],
    },

    ratings: {
        type: Number,
        max: 5
    },

    createdAt: {
      type: String,
      default:createdOn
    }
  })
  
  const productModel = mongoose.model('storeFront', productSchema);
  module.exports = productModel