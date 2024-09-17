const paymentRequestModel = require("../models/requestPay")
const userModel = require("../models/userModel")
const transactionModel = require("../models/transactionsModel")
const sendEmail = require("../Emails/email")
const transactionHistories = require('../models/transactionHistories')
const { requestEmail } = require("../Emails/requestPayment")
const notificationModel = require('../models/notificationModel')

exports.requestPayment = async (req, res) => {
    try {
        const requesterId = req.user.userId
        const { payerId, amount } = req.body

        if (!payerId || !amount ) {
            return res.status(400).json({
                 error: "provide all required fields." 
            })
        }

        // Find the requester and receiver
        const requester = await userModel.findById(requesterId)
        if (!requester) {
            return res.status(404).json({ 
                error: "User not found" 
            })
        }

        const receiver = await userModel.findOne({uniqueID: payerId})
        if (!receiver) {
            return res.status(404).json({
                 error: "Recipient not found" 
          })
        }
        
        const receiverName = `${receiver.firstName.toUpperCase()} ${receiver.lastName.slice(0,2).toUpperCase()}****`
        
        // Create a payment request
        const paymentRequest = new paymentRequestModel({
            requesterId,
            receiverId: payerId,
            amount,
        })

        await paymentRequest.save()

        // Send payment request email to the receiver
        const name = `${requester.firstName.toUpperCase()} ${requester.lastName.slice(0,2).toUpperCase()}****`
        const Email = requester.email
        const subject = `${name} requested a payment of ₦${amount}.`
        const paymentLink = `https://pronext.onrender.com/approve/${paymentRequest._id}`
        const denyLink = `https://pronext.onrender.com/deny_request/${paymentRequest._id}`
        const html = requestEmail(name, amount, paymentLink, denyLink, Email)
        await sendEmail({email:receiver.email, subject, html})

        res.status(200).json({
            message: `Request has been sent to ${receiverName}'s email`,
        })
    } catch (error) {
        res.status(500).json({
             error: error.message
      })
   }
}


exports.processPayment = async (req, res) => {
    try {
        const { paymentRequestId } = req.params

        const paymentRequest = await paymentRequestModel.findById(paymentRequestId)
        if (!paymentRequest) {
            return res.status(404).json({ 
                error: 'This request has been denied by you' 
            })
        }

        const receiver = await userModel.findOne({uniqueID :paymentRequest.receiverId})
        const requester = await userModel.findById(paymentRequest.requesterId)

        // Check if receiver has enough funds
        if (receiver.acctBalance < paymentRequest.amount) {
            return res.status(400).json({ 
                error: 'Insufficient funds' 
            })
        }

        // Deduct the amount from the receiver's account and credit the requester
        receiver.acctBalance -= paymentRequest.amount
        requester.acctBalance += paymentRequest.amount

        await receiver.save()
        await requester.save()

        const receiverName = `${receiver.firstName.toUpperCase()} ${receiver.lastName.slice(0,2).toUpperCase()}`
        const requesterName = `${requester.firstName.toUpperCase()} ${requester.lastName.toUpperCase()}`

        // Create a transaction record
        const transaction = new transactionModel({
            senderId: receiver,
            receiverId: requester._id,
            amount: paymentRequest.amount
        })

        transaction.status = 'completed',
        await transaction.save()


        paymentRequest.status = 'completed'
        await paymentRequest.save()

        // Notify the requester
        const notification = new notificationModel({
            message: `Payment request of ${paymentRequest.amount} has been approved.`,
            sender: receiverName,
            amountPaid: paymentRequest.amount
        })
        await notification.save()
        requester.notifications.push(notification._id)
        await requester.save()


        // Notify the receiver
        const senderHistory = new transactionHistories({
            message: `Transfer to ${receiverName} was successful`, 
            amountPaid: paymentRequest.amount,
            recipient:`${requesterName} | ${requester.uniqueID}`,
        })
        await senderHistory.save() 
        receiver.transactions.push(senderHistory._id)
        await receiver.save()

        res.status(200).json({ 
            message: 'Payment completed successfully' 
        })
    } catch (error) {
        res.status(500).json({
             error: error.message 
        })
    }
}


exports.denyPayment = async (req, res) => {
    try {
        const { paymentRequestId } = req.params

        const paymentRequest = await paymentRequestModel.findById(paymentRequestId)
        if (!paymentRequest) {
            return res.status(404).json({
                error: 'Payment request not found' 
            })
        }

        const requester = await userModel.findById(paymentRequest.requesterId)

        paymentRequest.status = 'denied'
        await paymentRequest.save()

        // Notify the requester
        const notification = new notificationModel({
            message: `Your payment request of ${paymentRequest.amount} was denied.`,
        })
        await notification.save()
        requester.notifications.push(notification._id)
        await requester.save()


        res.status(200).json({
            message:`Denied`
        })
    } catch (error) {
        res.status(500).json({
            error: error.message 
        })
    }
}


exports.getAllPaymentRequests = async (req, res) => {
    try {
        const userId = req.user.userId

        const requestedPayments = await paymentRequestModel.find({ requesterId: userId })

        if (requestedPayments && requestedPayments.length > 0) {
            return res.status(200).json({
                totalAmount_of_requestedPayment: requestedPayments.length,
                requestedPayments
            }) 
      } else {
            return res.status(404).json({
                message: "You haven't requested any payment yet."
        })       
     }
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })    }
}


exports.getOnePaymentRequest = async (req, res) => {
    try {
        const userId = req.user.userId
        const { requestedId } = req.params

        const requestedPayment = await paymentRequestModel.findById(requestedId)
        if (!requestedPayment) {
            return res.status(404).json({
                message: "Request not found."
            })
        }

        if (requestedPayment.requesterId.toString() !== userId) {
            return res.status(401).json({
                message: "Unauthenticated."
            })
        }

        return res.status(200).json(requestedPayment)
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}