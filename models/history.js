const mongoose = require("mongoose")
const date = new Date().toLocaleString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
const createdOn = `${date}`

const userSchema = new mongoose.Schema({

    history: { 
        type: String,
        ref: users
    }, 

    users: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: users
    }, 
    
    deposits: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: deposits
    },

    transfers: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: transfers
    },

    createdOn: {
        type: String,
        default: createdOn
    }
})

const userModel = mongoose.model("users", userSchema)

module.exports = userModel