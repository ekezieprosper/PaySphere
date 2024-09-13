const mongoose = require("mongoose")
const date = new Date().toLocaleString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
const createdOn = `${date}`

const historySchema = new mongoose.Schema({

    message:{
        type:String
    },

    amountPaid:{
        type: Number
    },

    fee:{
        type:Number,
        default: 0
    },

    sender:{
        type:String
    },

    recipient:{
        type:String
    },

    users: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },

    deposits: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "deposits"
    },

    transfers: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "transfers"
    },

    date: {
        type: String,
        default: createdOn
    }
})

const historyModel = mongoose.model("users", historySchema)

module.exports = historyModel