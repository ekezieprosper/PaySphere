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
        bankName: {type: String, trim: true},
        BankAcctNumber: {type: String, trim: true, match: [/^\d{10}$/, 'Invalid account number']},
        BVN: {type: String, trim: true, match: [/^\d{11}$/, 'Invalid BVN']}
    },

    cardDetails: {
        cardNumber: {type: String, trim: true, match: [/^\d{12,19}$/, 'Invalid card number']},
        expiryDate: {type: String, trim: true, match: [/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, 'Expiry date must be in MM/YY format']},
        cvv: {type: String, trim: true, match: [/^\d{3,4}$/, 'CVV must be 3 or 4 digits']},
        pin: {type: String, trim: true, match: [/^\d{4}$/, 'PIN must be 4 digits']}
    },

    status: { 
        type: String,
        enum: ['pending', 'completed', 'failed'], 
        default: 'pending'
    },

    // koraTransactionId: {
    //     type: String, // Store Kora Pay transaction ID(reference) here
    // },
    
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
