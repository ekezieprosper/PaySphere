const mongoose = require('mongoose')

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'storeFront',
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1]
  },
}, { _id: false })

const cartSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },

  items: [cartItemSchema],

  totalPrice: {
    type: Number,
    default: 0
}

})

const cartModel = mongoose.model('carts', cartSchema)
module.exports = cartModel