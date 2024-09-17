const transactionModel = require('../models/transactionsModel')
const userModel = require('../models/userModel')
const treasuryModel = require("../models/Treasury")
const confirmTransaction = require("../successfullTransactions/successfullTransactions")
const transactionHistories = require('../models/transactionHistories')
const notificationModel = require('../models/notificationModel')
const bcrypt = require("bcrypt")



exports.peer2PeerPaymentTransaction = async (req, res) => {
    try {
        const { recipientId, amount, pin } = req.body
        const id = req.user.userId

        if (!recipientId || !amount || !pin) {
            return res.status(400).json({
                 error: "provide all required fields." 
            })
        }

        const sender = await userModel.findById(id)
        const receiver = await userModel.findOne({ uniqueID: recipientId })

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

        if (amount < 100) {
            return res.status(400).json({
                 error: "Amount must be between ₦100 and above."
             })
        }
        
        // Check if sender has sufficient funds
        if (sender.acctBalance < amount) {
            return res.status(400).json({
                 error: 'Insufficient funds' 
            })
        }

        // Save the transaction but without debiting/crediting yet
        const transaction = await transactionModel.create({
            recipientId: receiver.uniqueID,
            amount,
            sender: id,
        })

        res.status(201).json({ 
            message: 'Transaction initiated',
             transactionId: transaction._id 
        })
    } catch (error) {
        res.status(500).json({
             error: error.message 
        })
    }
}


exports.proccessPeer2PeerPaymentTransaction = async (req, res) => {
    try {
        const { transactionId } = req.body
        const transaction = await transactionModel.findById(transactionId)

        if (!transaction) {
            return res.status(404).json({
             error: 'No transaction made' 
            })
        }

        // Confirm transaction status (assuming an external API call for confirmation)
        const confirmation = await confirmTransaction(transactionId) 

        if (confirmation.success) {
            transaction.status = 'completed'

        // If transaction is completed, proceed to credit and debit users
        const sender = await userModel.findById(transaction.sender)
        const receiver = await userModel.findById(transaction.recipientId)

        const receiverName = `${receiver.firstName.toUpperCase()} ${receiver.lastName.slice(0,2).toUpperCase()}****`
        const senderName = `${sender.firstName.toUpperCase()} ${sender.lastName.toUpperCase()}`

        // Debit sender and credit receiver
        sender.acctBalance -= transaction.amount
        receiver.acctBalance += transaction.amount

        const senderHistory = new transactionHistories({
            message: `Transfer to ${receiverName} was successfull`, 
            amountPaid: amount,
            recipient:`${receiverName} | ${receiver.uniqueID}`,
        })
        await senderHistory.save() 
        sender.histories.push(senderHistory._id)
       await sender.save()  
        
       const notifyReceiver = new notificationModel({
           message: `Money in from ${senderName}`, 
           amountPaid: amount,
           sender:`${senderName} | ${sender.uniqueID}`,
        })
      await notifyReceiver.save() 
      receiver.notifications.push(notifyReceiver._id)
      await receiver.save()

        } else {
            transaction.status = 'failed'
        }

        await transaction.save()
        res.status(200).json({
            message: 'Transaction Successful', 
            totalBalance: sender.acctBalance,
         })
    } catch (error) {
        res.status(500).json({
             error: error.message 
        })
    }
}


exports.createApp2BankTransaction = async (req, res) => {
    try {
        const { acctNumber, bank, amount, pin } = req.body
        const id = req.user.userId

        if (!acctNumber || !bank || !amount || !pin) {
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

        if (amount < 100) {
            return res.status(400).json({
                 error: "Amount must be between ₦100 and above." 
                })
        }

        // Create the transaction without debiting yet
        const transaction = await transactionModel.create({
            sender: id,
            acctNumber,
            bank,
            amount,
        })

        res.status(201).json({
            message: 'Transaction initiated', 
            transactionId: transaction._id 
        })
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        })
    }
}


exports.processBankTransaction = async (req, res) => {
    try {
        const { transactionId } = req.body
        const transaction = await transactionModel.findById(transactionId)

        if (!transaction) {
            return res.status(404).json({ 
                error: 'Transaction not found' 
            })
        }

        // Confirm transaction status via external bank API or payment service
        const confirmation = await confirmTransaction(transactionId) 

        if (confirmation.success) {
            transaction.status = 'completed'
        } else {
            transaction.status = 'failed'
            await transaction.save()
            return res.status(400).json({ 
                error: 'Transaction failed' 
            })
        }

        await transaction.save()

        // Proceed with crediting/debiting funds
        const sender = await userModel.findById(transaction.sender)
        if (!sender) {
            return res.status(404).json({
                error: 'Sender not found'
            })
        }

        const fee = 10
        sender.acctBalance -= transaction.amount + fee

        let treasury = await treasuryModel.findOne()
        if (!treasury) {
            treasury = new treasuryModel({ totalBalance: fee })
        } else {
            treasury.totalBalance += fee
        }

        await sender.save()
        await treasury.save()

        res.status(200).json({
            message: 'Transaction processed and funds transferred to bank'
        })
    } catch (error) {
        res.status(500).json({
             error: error.message 
        })
    }
}


// exports.makePaymentWithUSSD = async (req, res) => {
//     try {
//         const { sessionId, serviceCode, phoneNumber, text } = req.body
        
//         let response = ''
//         const input = text.split('*')

//         // Find the user by phone number
//         const user = await userModel.findOne({ phoneNumber })
//         if (!user) {
//             response = `END This phone number "${phoneNumber}" wasn't used while registering with us.`
//             return res.send(response)
//         }

//         if (text === '') {
//             response = `CON Welcome to our USSD service.
//         1. Check balance
//         2. Transfer money (within app)
//         3. Transfer money (to bank)`
//         } else if (input[0] === '1') {

//             // Option 1: Check balance
//             response = `END Your account balance is ₦${user.acctBalance}`

//         } else if (input[0] === '2' && input.length === 1) {

//             // Option 2: Transfer (within app) - Ask for recipient's unique ID
//             response = `CON Enter recipient's uniqueID:`

//         } else if (input[0] === '2' && input.length === 2) {

//             // Ask for amount to transfer within app
//             response = `CON Enter amount to transfer:`

//         } else if (input[0] === '2' && input.length === 3) {

//             // Ask for user's transfer PIN for internal transfer
//             response = `CON Enter your 4-digit transfer PIN:`

//         } else if (input[0] === '2' && input.length === 4) {
//             // Validate internal transfer
//             const recipientID = input[1]
//             const amount = parseFloat(input[2])
//             const pin = input[3]

//             // Validate recipient and perform the transfer
//             const recipient = await userModel.findOne({ uniqueID: recipientID })
//             if (!recipient) {
//                 response = `END Recipient not found.`
//             } else if (user.acctBalance < amount) {
//                 response = `END Insufficient funds.`
//             } else {
//                 // Verify the PIN
//                 const isPinValid = await bcrypt.compare(pin, user.pin)
//                 if (!isPinValid) {
//                     response = `END Invalid PIN.`
//                 } else {
//                     // Perform transfer
//                     user.acctBalance -= amount
//                     recipient.acctBalance += amount
//                     await user.save()
//                     await recipient.save()
//                     response = `END Your transaction of ₦${amount} to ${recipient.uniqueID} was successful.`
//                 }
//             }

//         } else if (input[0] === '3' && input.length === 1) {

//             // Option 3: Transfer to bank - Ask for recipient's bank account number
//             response = `CON Enter recipient's bank account number:`

//         } else if (input[0] === '3' && input.length === 2) {

//             // Ask for amount to transfer to the bank
//             response = `CON Enter amount to transfer:`

//         } else if (input[0] === '3' && input.length === 3) {

//             // Ask for the bank name or select from options
//             response = `CON Enter bank name:`

//         } else if (input[0] === '3' && input.length === 4) {

//             // Ask for transfer PIN for bank transfer
//             response = `CON Enter your 4-digit transfer PIN:`

//         } else if (input[0] === '3' && input.length === 5) {
//             // Validate bank transfer
//             const bankAccount = input[1]
//             const amount = parseFloat(input[2])
//             const bankName = input[3]
//             const pin = input[4]

//             // Verify PIN
//             const isPinValid = await bcrypt.compare(pin, user.pin)
//             if (!isPinValid) {
//                 response = `END Invalid PIN.`
//             } else if (user.acctBalance < amount) {
//                 response = `END Insufficient funds.`
//             } else {
//                 // Transfer to external bank (this involves integration with Kora Pay or another payment processor)
//                 try {
//                     const transferResult = await initiateBankTransfer({
//                         accountNumber: bankAccount,
//                         bankName: bankName,
//                         amount: amount,
//                         senderID: user.uniqueID,
//                     })

//                     if (transferResult.success) {
//                         // Deduct money from the user's account and save the transaction
//                         user.acctBalance -= amount
//                         await user.save()

//                         response = `END Your transaction of ₦${amount} to account ${bankAccount} at ${bankName} was successful.`
//                     } else {
//                         response = `END Transfer failed: ${transferResult.message}`
//                     }
//                 } catch (error) {
//                     console.error('Bank Transfer Error:', error)
//                     response = `END An error occurred while processing your transaction.`
//                 }
//             }
//         } else {
//             // Invalid option
//             response = `END Invalid option.`
//         }

//         // Set Content-Type to text/plain
//         res.set('Content-Type', 'text/plain')

//         // Send response to Africa's Talking
//         res.send(response)
//     } catch (error) {
//         console.error('USSD Error:', error.stack || error)
//         res.status(500).send('END An error occurred. Please try again later.')
//     }
// }



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
        response = `END Your account balance is ₦${user.acctBalance}`

        } else if (input[0] === '2' && input.length === 1) {

        // Option 2: Transfer - Ask for recipient's unique ID
        response = `CON Enter recipient's uniqueID:`

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
            const recipient = await userModel.findOne({ uniqueID: recipientID })
            if (!recipient) {
            response = `END Recipient not found.`

            } else if (user.acctBalance < amount) {
            response = `END Insufficient funds.`
            } else {
            // Verify the PIN
            const isPinValid = await bcrypt.compare(pin, user.pin) 
            if (!isPinValid) {
                response = `END Invalid PIN.`
           } else {
            // Perform transfer
            user.acctBalance -= amount
            recipient.acctBalance += amount
            await user.save()
            await recipient.save()
            response = `END Your transaction of ₦${amount} to ${recipient.uniqueID} was successful.`

            const receiverName = `${recipient.firstName.toUpperCase()} ${recipient.lastName.slice(0,2).toUpperCase()}****`
            const senderName = `${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()}`

            // create transaction history for the sender
            const senderHistory = new transactionHistories({
                message: `Transfer to ${receiverName} was successfull`, 
                amountPaid: amount,
                recipient:`${receiverName} | ${receiver.uniqueID}`,
            })
            await senderHistory.save() 
            user.histories.push(senderHistory._id)
           await user.save()  
            
           const notifyReceiver = new notificationModel({
               message: `Money in from ${senderName}`, 
               amountPaid: amount,
               sender:`${senderName} | ${sender.uniqueID}`,
            })
          await notifyReceiver.save() 
          recipient.notifications.push(notifyReceiver._id)
          await recipient.save()
         }
     }
        } else {
            response = `END Invalid option.`
        }

        // Set Content-Type to text/plain & response
        res.set('Content-Type', 'text/plain')
        res.send(response)

    } catch (error) {
        res.status(500).send('END An error occurred. Please try again later.')
    }
}