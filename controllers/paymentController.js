const paymentModel = require('../models/paymentModel')
const userModel = require('../models/userModel')
const treasuryModel = require("../models/Treasury")
const paymentRequestModel = require("../models/requestPay")
const sendEmail = require("../Emails/email")
const transactionHistories = require('../models/allTransactions')
const { requestEmail } = require("../Emails/requestPayment")
const { payEmail } = require("../Emails/payToNoneUsers")
const notificationModel = require('../models/notificationModel')
const crypto = require('crypto')
const bcrypt = require("bcrypt")
require('dotenv').config()




exports.creditWalletThroughBankDeposit = async (req, res) => {
    try {
        const id = req.user.userId
        const { walletID, amount } = req.body

        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        const receiver = await userModel.findOne({ walletID })
        if (receiver) {
            const deposit = new paymentModel({
                recipientId: walletID,
                amount: amount,
                status: 'completed'

            })
            await deposit.save()

            receiver.wallet += amount
            await receiver.save()
        } else {
            return res.status(404).json({
                message: "Transaction failed"
            })
        }

        return res.status(200).json({
            wallet: `$${receiver.wallet}`
        })

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}


exports.transferFromWalletToBank = async (req, res) => {
    try {
        const id = req.user.userId
        const { amount } = req.body

        const sender = await userModel.findById(id)
        if (!sender) {
            return res.status(404).json({
                message: "Sender not found"
            })
        }

        const fee = 0.50

        // Check if sender has sufficient funds
        if (sender.wallet >= amount + fee) {

            const deposit = new paymentModel({
                senderId: id,
                amount: amount,
                feeCharged: fee,
                status: 'completed'
            })
            await deposit.save()

            sender.wallet -= (amount + fee)

            let treasury = await treasuryModel.findOne()

            if (!treasury) {
                treasury = new treasuryModel({ Balance: fee })
            } else {
                treasury.Balance += fee
            }

            await treasury.save()
            await sender.save()

            return res.status(200).json({
                message: 'Transfer successful',
                amountPaid: `$${amount}`
            })

        } else {
            return res.status(400).json({
                error: 'Insufficient funds'
            })
        }

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}


exports.creditUser = async (req, res) => {
    try {
        const { walletID, amount } = req.body

        const receiver = await userModel.findOne({ walletID })
        if (receiver) {

            receiver.wallet += amount
            await receiver.save()

            const deposit = new paymentModel({
                recipientId: walletID,
                amount: amount,
                status: 'completed'
            })
            await deposit.save()

        } else if (!receiver) {
            return res.status(404).json({
                message: "Recipient not found"
            })
        } else {
            return res.status(404).json({
                message: "Transaction failed"
            })
        }

        return res.status(200).json({
            wallet: `$${receiver.wallet}`
        })

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}


exports.debitUser = async (req, res) => {
    try {
        const { walletID, amount } = req.body

        const sender = await userModel.findOne({ walletID })
        if (!sender) {
            return res.status(404).json({
                message: "Sender not found"
            })
        }

        const fee = 0.50

        // Check if sender has sufficient funds
        if (sender.wallet >= amount + fee) {

            const deposit = new paymentModel({
                senderId: sender._id,
                amount: amount,
                feeCharged: fee,
                status: 'completed'
            })
            await deposit.save()

            sender.wallet -= (amount + fee)

            const treasury = await treasuryModel.findOne()
            treasury.Balance += fee

            await treasury.save()
            await sender.save()

            return res.status(200).json({
                message: 'Transfer successful',
                amountPaid: `$${amount}`
            })

        } else {
            return res.status(400).json({
                error: 'Insufficient funds'
            })
        }

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}


exports.treasuryPercentage = async (req, res) => {
    try {
        const { walletID, amount } = req.body

        const receiver = await userModel.findOne({ walletID })
        if (!receiver) {
            return res.status(404).json({
                message: "Receiver not found"
            })
        }

        // Calculate 10% for the treasury
        const percentage = amount * 0.10
        const remainingAmount = amount - percentage

        const treasury = await treasuryModel.findOne()
        treasury.Balance += percentage
        await treasury.save()

        // Add the remaining amount to the receiver's wallet
        receiver.wallet += remainingAmount
        await receiver.save()

        return res.status(200).json({
            message: "Transaction successful",
            receiverAmount: `$${remainingAmount}`
        })

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}


exports.peer2PeerPaymentTransaction = async (req, res) => {
    try {
        const id = req.user.userId
        const { walletID, amount, pin } = req.body

        if (!walletID || !amount || !pin) {
            return res.status(400).json({
                error: "Provide all required fields."
            })
        }

        const sender = await userModel.findById(id)
        const receiver = await userModel.findOne({ walletID })

        if (!sender || !receiver) {
            return res.status(404).json({
                error: 'Invalid user or recipient.'
            })
        }

        const checkPin = await bcrypt.compare(pin, sender.pin)
        if (!checkPin) {
            return res.status(400).json({
                error: "Incorrect transfer pin."
            })
        }

        if (amount < 5) {
            return res.status(400).json({
                error: "Amount must be between $5 and above."
            })
        }

        if (sender.wallet < amount) {
            return res.status(400).json({
                error: 'Insufficient funds'
            })
        }

        const transaction = await paymentModel.create({
            recipientId: receiver.walletID,
            amount,
            sender: id,
        })

        const receiverName = `${receiver.firstName.toUpperCase()} ${receiver.lastName.toUpperCase()}`
        const senderName = `${sender.firstName.toUpperCase()} ${sender.lastName.toUpperCase()}`

        if (!transaction) {
            transaction.status = 'failed'
            const receiverHistory = new transactionHistories({
                message: `Transfer from ${senderName} failed`,
                amount: amount,
                recipient: receiver._id
            })
            await receiverHistory.save()
            receiver.transactions.push(receiverHistory._id)
            await receiver.save()

            return res.status(500).json({
                error: 'Transaction initiation failed.'
            })
        }

        // Debit sender and credit receiver
        sender.wallet -= amount
        receiver.wallet += amount

        const senderHistory = new transactionHistories({
            message: `Transfer to ${receiverName}`,
             status: 'successful',
            amount: amount,
            amountPaid: amount,
            fee: 0,
            receiptDetails: `${receiverName} | ${receiver.walletID}**`,
            transactionType: "Transfer to PaySphere Account",
            recipient: sender._id

        })
        await senderHistory.save()
        sender.transactions.push(senderHistory._id)
        await sender.save()

        const receiverHistory = new transactionHistories({
            message: `Transfer from ${senderName}`,
            status: 'successful',
            amountPaid: amount,
            transactionType: "Wallet to wallet",
            senderDetails: `${senderName} | ${sender.walletID}**`,
            creditedTo: "Wallet",
            recipient: receiver._id
        })
        await receiverHistory.save()
        receiver.transactions.push(receiverHistory._id)
        await receiver.save()

        const notifyReceiver = new notificationModel({
            message: `Money in from ${senderName}`,
            amountPaid: amount,
            sender: `${senderName}`,
            recipient: receiver._id
        })
        await notifyReceiver.save()
        receiver.notifications.push(notifyReceiver._id)
        await receiver.save()

        transaction.status = 'completed'
        await transaction.save()

        res.status(200).json({
            message: 'Transaction Successful',
            amountPaid: `$${amount}`
        })

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}


exports.requestForPayment = async (req, res) => {
    try {
        const requesterId = req.user.userId
        const { payerId, amount } = req.body

        if (!payerId || !amount) {
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

        const receiver = await userModel.findOne({ walletID: payerId })
        if (!receiver) {
            return res.status(404).json({
                error: "Recipient not found"
            })
        }

        if (requester.walletID === payerId) {
            return res.status(400).json({
                error: "You cannot request a payment from yourself."
            })
        }

        const receiverName = `${receiver.firstName.toUpperCase()} ${receiver.lastName.toUpperCase()}`

        // Create a payment request
        const paymentRequest = new paymentRequestModel({
            requesterId,
            receiverId: receiver.walletID,
            amount,

        })
        await paymentRequest.save()
        const transactionId = paymentRequest._id

        // Send payment request email to the receiver
        const name = `${requester.firstName.toUpperCase()} ${requester.lastName.toUpperCase()}`
        const Email = requester.email
        const subject = `${name} requested a payment of $${amount}.`
        const paymentLink = `https://paysphere.vercel.app/approve/${transactionId}`
        const denyLink = `https://paysphere.vercel.app/deny/${transactionId}`
        const html = requestEmail(name, amount, paymentLink, denyLink, Email)
        await sendEmail({ email: receiver.email, subject, html })

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
        const {pin} = req.body

        const paymentRequest = await paymentRequestModel.findById(paymentRequestId)
        if (!paymentRequest) {
            return res.status(404).json({
                error: ' Request was not found'
            })
        }

        const receiver = await userModel.findOne({ walletID: paymentRequest.receiverId })
        const requester = await userModel.findById(paymentRequest.requesterId)

        const receiverName = `${receiver.firstName.toUpperCase()} ${receiver.lastName.toUpperCase()}`
        const requesterName = `${requester.firstName.toUpperCase()} ${requester.lastName.toUpperCase()}`

        const checkPin = await bcrypt.compare(pin, receiver.pin)
        if (!checkPin) {
            return res.status(400).json({
                error: "Incorrect transfer pin."
            })
        }

        // Check if the receiver has enough funds
        if (receiver.wallet < paymentRequest.amount) {

            // Notify the requester
            const alertSender = new notificationModel({
                message: `Payment request of ${paymentRequest.amount} to ${receiverName} failed due to the payer insufficient funds.`,
                expectedAmount: paymentRequest.amount,
                recipient: requester._id
            })
            await alertSender.save()
            requester.notifications.push(alertSender._id)
            await requester.save()

            return res.status(400).json({
                error: 'Insufficient funds'
            })
        } else {
            // Deduct the amount from the receiver's account and credit the requester
            receiver.wallet -= paymentRequest.amount
            requester.wallet += paymentRequest.amount

            await receiver.save()
            await requester.save()

            // Create a transaction record
            const transaction = new paymentModel({
                senderId: receiver._id,
                recipientId: requester._id,
                amount: paymentRequest.amount,
                status: 'completed'
            })
            await transaction.save()

            // Mark payment request as completed
            paymentRequest.status = 'completed'
            await paymentRequest.save()

            const requesterHistory = new transactionHistories({
                message: `Transfer from ${receiverName}`,
                status: 'successful',
                amountPaid: paymentRequest.amount,
                transactionType: "Request payment",
                senderDetails: `${receiverName} | ${receiver.walletID}**`,
                creditedTo: "Wallet",
                recipient: requester._id
            })
            await requesterHistory.save()
            requester.transactions.push(requesterHistory._id)
            await requester.save()

            // Notify the requester if successful
            const notification = new notificationModel({
                message: `Your request for ${paymentRequest.amount} has been approved.`,
                sender: receiverName,
                amountPaid: paymentRequest.amount,
                recipient: requester._id
            })
            await notification.save()
            requester.notifications.push(notification._id)
            await requester.save()

            // Notify the receiver (transaction history)
            const senderHistory = new transactionHistories({
                message: `Transfer to ${requesterName}`,
                status: 'successful',
                amount:  paymentRequest.amount,
                amountPaid:  paymentRequest.amount,
                fee: 0,
                receiptDetails: `${requesterName} | ${requester.walletID}**`,
                transactionType: "Transfer to PaySphere Account",
                recipient: receiver._id
            })
            await senderHistory.save()
            receiver.transactions.push(senderHistory._id)
            await receiver.save()

            res.status(200).json({
                message: 'Payment completed successfully',
                amountPaid: `$${paymentRequest.amount}`
            })
        }
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
            message: `Your request for ${paymentRequest.amount} was denied.`,
            recipient: requester._id

        })
        await notification.save()
        requester.notifications.push(notification._id)
        await requester.save()

        res.status(200).json({
            message: `Denied`
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
                message: "You haven't requested for any payment yet."
            })
        }
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
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


exports.sendMoneyViaEmail = async (req, res) => {
    try {
        const id = req.user.userId
        const { recipientEmail, amount } = req.body

        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({
                message: "user not found"
            })
        }

        if (user.wallet < amount) {
            return res.status(400).json({
                error: 'Insufficient funds'
            })
        }

        const token = crypto.randomBytes(32).toString('hex')

        const transaction = new paymentModel({
            senderId: id,
            recipientEmail: recipientEmail.toLowerCase(),
            amount,
            token,
            status: 'pending'
        })

        await transaction.save()

        const senderName = `${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()}`
        const senderEmail = user.email
        const subject = `You've received $${amount} from ${user.firstName}`
        const claimLink = `https://paysphere.vercel.app/signup?token=${token}`

        const html = payEmail(senderName, amount, claimLink, senderEmail)

        await sendEmail({ email: recipientEmail, subject, html })

        res.status(200).json({
            message: "sent",
        })

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}


exports.makePaymentWithUSSD = async (req, res) => {
    try {
        const { sessionId, serviceCode, phoneNumber, text } = req.body

        let response = ''
        const input = text.split('*')

        // Find the user by phone number
        const user = await userModel.findOne({ phoneNumber })
        if (!user) {
            response = `END This phone number "${phoneNumber}" wasn't used while regristering with us.`
            return res.send(response)
        }

        if (text === '') {
            response = `CON Welcome to our USSD service.
        1. Check balance
        2. Transfer money`
        } else if (input[0] === '1') {

            // Option 1: Check balance
            response = `END Your account balance is $${user.wallet}`

        } else if (input[0] === '2' && input.length === 1) {

            // Option 2: Transfer - Ask for recipient's unique ID
            response = `CON Enter recipient's walletID:`

        } else if (input[0] === '2' && input.length === 2) {

            // Ask for amount to transfer
            response = `CON Enter amount to transfer:`

        } else if (input[0] === '2' && input.length === 3) {
            // Ask for the user's transfer PIN
            response = `CON Enter your 4-digit transfer PIN:`

        } else if (input[0] === '2' && input.length === 4) {
            // Validate the transaction
            const recipientID = input[1]
            const amount = parseFloat(input[2])
            const pin = input[3]

            // Validate recipient and perform the transfer
            const recipient = await userModel.findOne({ walletID: recipientID })
            if (!recipient) {
                response = `END Recipient not found.`

            } else if (user.wallet < amount) {
                response = `END Insufficient funds.`
            } else {
                // Verify the PIN
                const isPinValid = await bcrypt.compare(pin, user.pin)
                if (!isPinValid) {
                    response = `END Invalid PIN.`
                } else {
                    // Perform transfer
                    user.wallet -= amount
                    recipient.wallet += amount

                    const receiverHistory = new transactionHistories({
                        message: `Transfer from ${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()}`,
                        status: 'successful',
                        amountPaid: amount,
                        transactionType: "USSD payment",
                        senderDetails: `${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()} | ${user.walletID}**`,
                        creditedTo: "Wallet",
                        recipient: recipient._id
                    })
                    await receiverHistory.save()
                    recipient.transactions.push(receiverHistory._id)
                    await recipient.save()


                    const senderHistory = new transactionHistories({
                        message: `Transfer to ${recipient.firstName.toUpperCase()} ${recipient.lastName.toUpperCase()}`,
                        status: 'successful',
                        amount: amount,
                        amountPaid: amount,
                        fee: 0,
                        receiptDetails: `${recipient.firstName.toUpperCase()} ${recipient.lastName.toUpperCase()} | ${recipient.walletID}**`,
                        transactionType: "Transfer to PaySphere Account",
                        recipient: user._id
                    })
                    await senderHistory.save()
                    user.transactions.push(senderHistory._id)
                    await user.save()

                    response = `END Transaction successful!`
                }
            }
        } else {
            // Invalid option
            response = `END Invalid option.`
        }

        // Set Content-Type to text/plain & response
        res.set('Content-Type', 'text/plain')
        res.send(response)

    } catch (error) {
        res.status(500).send('END An error occurred. Please try again later.')
    }
}