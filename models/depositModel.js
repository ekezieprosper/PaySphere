const mongoose = require('mongoose')
const date = new Date().toLocaleString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
const time = new Date().toLocaleString('en-NG', { 
    timeZone: 'Africa/Lagos', 
    hour: '2-digit', 
    minute: '2-digit', 
    hourCycle: 'h12' 
  })
  
const [hour, minute, period] = time.split(/[:\s]/)
const createdOn = `${date} ${hour}:${minute} ${period}`



const depositSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, 
        ref: 'users', 
        required: true 
    },

    amount: { 
        type: Number, 
        required: true 
    },

    bankDetails: {
        bankName: {type: String},
        BankAcct: {type: String},
        BVN: {type: String}
    },

    cardDetails: {
        cardNumber: {type: String},
        expiryDate: {type: String},
        cvv: {type: String},
        pin: {type: String}
    },

    status: { 
        type: String,
        enum: ['pending', 'completed', 'failed'], 
        default: 'pending'
    },
    
    transactionDate: { 
        type: String,
        default: createdOn
     },
   }
)

// Pre-save middleware to capitalize the first letter of bankName
depositSchema.pre('save', function(next) {
    if (this.bankDetails && this.bankDetails.bankName) {
        this.bankDetails.bankName = this.bankDetails.bankName.charAt(0).toUpperCase() + this.bankDetails.bankName.slice(1)
    }
    next()
})

const depositModel = mongoose.model("deposits", depositSchema)
module.exports = depositModel
