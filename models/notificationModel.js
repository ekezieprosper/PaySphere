const mongoose = require('mongoose')
const dateOptions = { 
  timeZone: 'Africa/Lagos', 
  day: '2-digit', 
  month: 'short', 
  year: 'numeric' 
}

const createdOn = new Date().toLocaleDateString('en-NG', dateOptions)


const notificationSchema = new mongoose.Schema({
 
  message:{
    type:String
  },

  expectedAmount:{
    type: Number
  },

  amountPaid:{
    type: Number
  },

  sender:{
    type:String
  },

  recipient: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'users'
 },
 
  date:{
    type:String,
    default:createdOn
 },
})


const Notification = mongoose.model('notifications', notificationSchema)

module.exports = Notification