const mongoose = require('mongoose')
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


const transferSchema = new mongoose.Schema({

    senderId: {
          type: mongoose.Schema.Types.ObjectId,
        ref: "users"
   },
   
   recipientId: {
         type:String
    },

    feeCharged:{
      type:Number,
  },

    amount:{ 
        type: Number 
    },

    recipientEmail: {
      type: String
  },

  token: {
    type: String
  },

    status:{ type: String,
         enum: ['pending', 'completed', 'failed'],
         default: 'pending' 
    },

    transactionDate: {
        type: String,
        default: createdOn
    },

    relatedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
      },

    relatedOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      },
})


const transferModel = mongoose.model('transactions', transferSchema)
module.exports = transferModel