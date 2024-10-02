const mongoose = require("mongoose")
const options = { 
  timeZone: 'Africa/Lagos', 
  day: '2-digit', 
  month: 'short', 
  year: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit', 
  hourCycle: 'h12' 
}
const dateTime = new Date().toLocaleString('en-NG', options)

// Extract the date and time parts
const [date, time] = dateTime.split(', ')
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