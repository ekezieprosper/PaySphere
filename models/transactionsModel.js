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
    sender:{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users'
    },

    recipientId: {
         type:String
    },

    acctNumber: { 
        type: String
    },

    bank:{ 
        type: String
    },

    amount:{ 
        type: Number 
    },

    status:{ type: String,
         enum: ['pending', 'completed', 'failed'],
         default: 'pending' 
    },

    // koraTransactionId: {
    //     type: String, // Store Kora Pay transaction ID(reference) here
    // },

    transactionDate: {
        type: String,
        default: createdOn
    }
})

const transferModel = mongoose.model('transfers', transferSchema)
module.exports = transferModel