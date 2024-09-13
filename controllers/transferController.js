const transferModel = require('../models/transferModel')
const userModel = require('../models/userModel')

// Handle user-to-user transfer
exports.transferFunds = async (req, res) => {
    try {
        const id = req.user.userId
        const {receiverId, amount } = req.body

        // Find sender and receiver
        const sender = await userModel.findById(id)
        const receiver = await userModel.findOne({uniqueID})

        if (!sender || !receiver) {
            return res.status(404).json({
                 error: 'User not found' 
            })
        }

        // Check if sender has sufficient balance
        if (sender.balance < amount) {
            return res.status(400).json({
                 error: 'Insufficient funds' 
            })
        }

        sender.balance -= amount
        receiver.balance += amount

        await sender.save()
        await receiver.save()

        // Log transfer in Transfer model
        await transferModel.create({
            sender: id,
            receiver: receiverId,
            amount
        })

        res.status(201).json({
             message: 'Transfer successful', 
             totalBalance: sender.balance,
         })
    } catch (error) {
        res.status(500).json({
            error: error.message
       })
    }
}
