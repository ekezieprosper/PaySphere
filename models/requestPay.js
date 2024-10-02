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
  
const [date, time] = dateTime.split(', ')
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