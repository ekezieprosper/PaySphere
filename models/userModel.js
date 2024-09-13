const mongoose = require("mongoose")
const countryCodes = require("../enums/countryCodes")
const date = new Date().toLocaleString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
const createdOn = `${date}`

const userSchema = new mongoose.Schema({
    Username: { 
        type: String, 
        required: true,
        unique: true 
    },
    
    email: { 
        type: String,
        required: true,
    },

    password: { 
        type: String, 
        required: true 
    },

    countryCode: {
        type: String,
        enum: countryCodes, 
        trim: true
    },

    phoneNumber: { 
        type: String,
        required: true,
        unique: true ,
        trim: true
    },

    profileImg: {
        type: String,
        default: "https://i.pinimg.com/564x/76/f3/f3/76f3f3007969fd3b6db21c744e1ef289.jpg"
    },

    verified: { 
        type: Boolean,
         default: false 
    },

    uniqueID: {
        type: String
    },

    pin: {
        type: String
    },

    acctBalance: {
        type: Number,
        default: 0
    },

    emailCount: { 
        type: Number, default: 0 
    },

    notifications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'notification'
    }],

    histories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'historyModel'
    }],

    createdOn: {
        type: String,
        default: createdOn
    }
})

const userModel = mongoose.model("users", userSchema)

module.exports = userModel