const mongoose = require("mongoose")
const date = new Date().toLocaleString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
const time = new Date().toLocaleString('en-NG', { 
    timeZone: 'Africa/Lagos', 
    hour: '2-digit', 
    minute: '2-digit', 
    hourCycle: 'h12' 
  })
  
const [hour, minute, period] = time.split(/[:\s]/)
const createdOn = `${date} ${hour}:${minute}${period}`


const orderSchema = new mongoose.Schema({
  buyerDetails: {
    name: String,
    email: String,
    phoneNumber: String,
  },

  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users',
  },

  cartDetails: [
    {
      product_name: String,
      quantity: Number,
      price: Number,
    }
  ], 

  totalPrice: { type: Number },

  orderID: { type: String },

  createdAt: {
    type: String,
    default: createdOn,
  }

})


const orderModel = mongoose.model('orders', orderSchema)
module.exports = orderModel