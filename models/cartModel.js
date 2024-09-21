const mongoose = require("mongoose")

const cartSchema = new mongoose.Schema({

  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'storeFront',
    required: true,
  },

  quantity: {
    type: Number,
    default: 1,
  }
})

const cartModel = mongoose.model('categories', cartSchema)
module.exports = cartModel