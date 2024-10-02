const mongoose = require("mongoose")
const dateOptions = { 
    timeZone: 'Africa/Lagos', 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }
const createdOn = new Date().toLocaleDateString('en-NG', dateOptions)

const treasurySchema = new mongoose.Schema({
    users: { 
          type: mongoose.Schema.Types.ObjectId, 
        ref: 'users'
    },
    
   Balance: {
        type: Number,
        default: 0
    },

    date: {
        type: String,
        default: createdOn
    }
})

const treasuryModel = mongoose.model("treasury", treasurySchema)

module.exports = treasuryModel