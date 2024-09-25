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
    receiptID: {
       type: mongoose.Schema.Types.ObjectId
    },

    date: {
        type: String,
        default: createdOn
    }
})

const historyModel = mongoose.model("allTransactions", historySchema)

module.exports = historyModel