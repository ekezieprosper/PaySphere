const Transfer = require('../models/transferModel');
const User = require('../models/userModel');

// Handle user-to-user transfer
exports.transferFunds = async (req, res) => {
    try {
        const { senderId, receiverId, amount } = req.body;

        // Find sender and receiver
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if sender has sufficient balance
        if (sender.balance < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Perform transfer: Deduct from sender and add to receiver
        sender.balance -= amount;
        receiver.balance += amount;

        await sender.save();
        await receiver.save();

        // Log transfer in Transfer model
        await Transfer.create({
            sender: senderId,
            receiver: receiverId,
            amount
        });

        res.status(201).json({ message: 'Transfer successful', senderBalance: sender.balance, receiverBalance: receiver.balance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
