const transferModel = require('../models/transferModel')
const userModel = require('../models/userModel')
// const treasury = require("../models/Treasury")
const transactionHistories = require('../models/transactionHistories')
const notificationModel = require('../models/notificationModel')
const bcrypt = require("bcrypt")



exports.user2userTransfer = async (req, res) => {
    try {
        const id = req.user.userId
        const {recipientId, amount, pin } = req.body

        if (!recipientId || !amount || !pin) {
            return res.status(400).json({
                 error: "provide all required fields." 
            })
        }
        
        const sender = await userModel.findById(id)
        const receiver = await userModel.findOne({uniqueID: recipientId})
        
        if (!sender) {
            return res.status(404).json({
                error: 'user not found' 
            })
        }
        if (!receiver ) {
            return res.status(404).json({
                error: `Recipient ID "${recipientId}" does not exist` 
            })
        }

        const checkPin = await bcrypt.compare(pin, sender.pin)
        if (!checkPin) {
            return res.status(400).json({
                error: "Incorrect transfer pin."
            })
        }

        if (amount < 10) {
            return res.status(400).json({
                error: "amount must be from than 10 upwards." 
          })
        }

        // Check if sender has sufficient balance
        if (sender.acctBalance < amount) {
            return res.status(400).json({
                 error: 'Insufficient funds' 
            })
        }
        const sent = sender.acctBalance -= amount
        const received = receiver.acctBalance += amount

        const transaction = await transferModel.create({
            recipientId,
            amount,
            sender: id
        })

        if (transaction) {
         transaction.status = 'completed'
        }else{
           transaction.status = 'failed'
        }
        await transaction.save()

        if (sent) {
            const senderHistory = new transactionHistories({
                message: `Transfer to ${receiver.Username.toUpperCase()}`, 
                amountPaid: amount,
                // fee: 0,
                recipient:`${receiver.Username.toUpperCase()} | ${receiver.uniqueID}`,
                date
            })
            await senderHistory.save() 
            sender.notifications.push(senderHistory._id)
           await sender.save()
        }

        if (received) {
            const notifyReceiver = new notificationModel({
                message: `Money in from ${sender.Username.toUpperCase()}`, 
                amountPaid: amount,
                sender:`${sender.Username.toUpperCase()} | ${sender.uniqueID}`,
                date
            })
            await notifyReceiver.save() 
            receiver.notifications.push(notifyReceiver._id)
           await receiver.save()
        }

        res.status(201).json({
             message: 'Transaction completed', 
             totalBalance: sender.acctBalance,
         })
    } catch (error) {
        res.status(500).json({
            error: error.message
       })
    }
}


exports.app2BankTransfer = async (req, res) => {
    try {
        const id = req.user.userId
        const {acctNUmber, bank, amount, pin} = req.body

        if (!acctNUmber ||!bank ||!amount ||!pin) {
            return res.status(400).json({
                 error: "provide all required fields." 
            })
        }
        
        const sender = await userModel.findById(id)
        if (!sender) {
            return res.status(404).json({
                error: 'user not found' 
            })
        }

        const checkPin = await bcrypt.compare(pin, sender.pin)
        if (!checkPin) {
            return res.status(400).json({
                error: "Incorrect transfer pin."
            })
        }

        if (amount < 10) {
            return res.status(400).json({
                error: "amount must be from than 10 upwards." 
          })
        }

        // Check if sender has sufficient balance
        if (sender.acctBalance < amount) {
            return res.status(400).json({
                 error: 'Insufficient funds' 
            })
        }

        const transaction = await transferModel.create({
            sender: id,
            acctNUmber,
            bank,
            amount
        })

        if (transaction) {
            sender.acctBalance -= amount
            await sender.save()

           transaction.status = 'completed'
        }else{
           transaction.status = 'failed'
        }

        await transaction.save()

        res.status(201).json({
             message: 'Transaction completed', 
             totalBalance: sender.acctBalance,
         })
    } catch (error) {
        res.status(500).json({
            error: error.message
       })
    }
}


exports.makePaymentWithUSSD = async (req, res) => {
  try {
    const { ussdCode } = req.body

    const regex = /\*475\*11\*(\d{10})\*(\d{2,})\*(\d{4})#/
    const match = ussdCode.match(regex)
    if (!match) {
      return res.status(400).json({ 
        message: 'Invalid USSD code' 
    })
    }

    const recipientAccountNumber = match[1]
    const amount = parseInt(match[2])
    const senderPin = match[3]

    // Find the sender from the authenticated user
    const sender = await userModel.findOne({senderPin})
    if (!sender) {
      return res.status(404).json({
         message: "You don't have an account with us"
        })
    }

    // Validate the sender's PIN
    const checkPin = await bcrypt.compare(senderPin, sender)
    if (!checkPin) {
        return res.status(400).json({
            error: "Incorrect transfer pin."
        })
    }

    // Check if sender has enough balance
    if (sender.acctBalance < amount) {
      return res.status(400).json({
         message: 'Insufficient funds' 
        })
    }

    // Find the recipient by account number
    const recipient = await userModel.findOne({recipientId: recipientAccountNumber})
    if (!recipient) {
      return res.status(404).json({
         message: 'Recipient not found' 
       })
    }

    const transaction = await transferModel.create({
        sender: sender._id,
        recipientId: recipientAccountNumber,
        amount
    })

    if (transaction) {
        sender.acctBalance -= amount
       recipient.acctBalance += amount

       await sender.save()
       await recipient.save()

       transaction.status = 'completed'
    }else{
       transaction.status = 'failed'
    }

    await transaction.save()

    res.status(201).json({
         message: 'Transaction completed', 
         totalBalance: sender.acctBalance,
     })

  } catch (error) {
    return res.status(500).json({
         message: 'Internal server error' 
        })
  }
}