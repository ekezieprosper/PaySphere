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

const payRequestSchema = new mongoose.Schema({

    requesterId:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', 
    },

    receiverId: {
        type:String,
   },

    amount:{ 
        type: Number, 
    },

    status:{ 
        type: String, 
        enum: ['pending', 'completed', 'denied'], 
        default: 'pending' 
    },

    date:{ 
        type: String, 
        default: createdOn
    },
})

const requestPayModel = mongoose.model("paymentRequest", payRequestSchema)

module.exports = requestPayModel