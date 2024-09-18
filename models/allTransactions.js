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

    amountPaid:{
        type: Number
    },

    fee:{
        type:Number,
    },

    sender:{
        type:String
    },

    recipient:{
        type:String
    },

    users: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },

    transactions: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "transactions"
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