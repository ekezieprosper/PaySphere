const transactionHistories = require('../models/allTransactions')
const userModel = require("../models/userModel")


exports.getAllUserTransactions = async (req, res) => {
    try {
        const id = req.user.userId

        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({
                message: "User not found."
            })
        }

        // Retrieve all transactions for the user
        const transactions = await transactionHistories.find({user: id })
        if (transactions.length === 0) {
            return res.status(404).json({
                message: "You don't have any transactions yet."
            })
        }

        // Return the transactions
        res.status(200).json(transactions)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}


exports.getTransactionById = async (req, res) => {
    try {
        const id = req.user.userId
        const { transactionId } = req.params

        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({
                message: "User not found."
            })
        }

        // Check if the transaction exists and is in the user's transactions field
        const transaction = await transactionHistories.findOne({ _id: transactionId, user: id })
        if (!transaction) {
            return res.status(404).json({
                message: "Only owner can access this transaction"
            })
        }

        // Return the single transaction
        res.status(200).json(transaction)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}


exports.deleteTransaction = async (req, res) => {
    try {
        const id = req.user.userId
        const { transactionId } = req.params

        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({
                 error: "User not found" 
                })
        }

        const transaction = await transactionHistories.findOne({ _id: transactionId, user: id })
        if (!transaction) {
            return res.status(404).json({
           message: "Unauthorized"
          })
        } 

        const deletetransaction = await transactionHistories.findByIdAndDelete(transactionId)
        if (!deletetransaction) {
            return res.status(404).json({
                 error: "transaction not found" 
                })
        }

        // Remove the transaction ID from the user transactions array
        const indextransaction = user.transactions.indexOf(transactionId)

        if (indextransaction !== -1) {
            user.transactions.splice(indextransaction, 1)
            await user.save()
        }

        return res.status(200).json({
             message: "Deleted"
             })

    } catch (error) {
        return res.status(500).json({
             message: error.message 
        })
    }
}