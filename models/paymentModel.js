const mongoose = require('mongoose')
const date = new Date().toLocaleString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
const time = new Date().toLocaleString('en-NG', { 
    timeZone: 'Africa/Lagos', 
    hour: '2-digit', 
    minute: '2-digit', 
    hourCycle: 'h12' 
  })
  
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

    amount:{ 
        type: Number 
    },

    recipientEmail: {
      type: String
  },

  token: {
    type: String,
    unique: true
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