const mongoose = require('mongoose')
const date = new Date().toLocaleString('en-NG', {day: '2-digit', month: 'short', year:'numeric'})
const createdOn = `${date}`


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