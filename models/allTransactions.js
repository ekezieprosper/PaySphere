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
    
const historySchema = new mongoose.Schema({

    message:{
        type:String
    },

    amount:{
        type: Number
    },

    amountPaid:{
        type: Number
    },

    fee:{
        type:Number,
    },

    receiptDetails:{
        type:String
    },
    
    senderDetails: {
        type:String
    },

    transactionType:{
      type:String
   },

   creditedTo:{
      type:String
   },

   recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },

   transactionNumber: {
    type: mongoose.Schema.Types.ObjectId
   },

   transactions: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "transactions"
    },
    status:{ type: String,
        enum: ['pending', 'successful', 'failed'],
        default: 'pending' 
   },

    date: {
        type: String,
        default: createdOn
    }
})

const historyModel = mongoose.model("allTransactions", historySchema)

module.exports = historyModel