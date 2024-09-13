const mongoose = require("mongoose")
const date = new Date().toLocaleString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
const createdOn = `${date}`

const treasurySchema = new mongoose.Schema({
    users: { 
          type: mongoose.Schema.Types.ObjectId, 
        ref: 'users'
    },

    admins: { 
        type: mongoose.Schema.Types.ObjectId, 
      ref: 'admin'
  },

    totalBalance: {
        type: Number,
        default: 0
    },

    date: {
        type: String,
        default: createdOn
    }
})

const treasuryModel = mongoose.model("users", treasurySchema)

module.exports = treasuryModel