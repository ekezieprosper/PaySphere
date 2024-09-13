const depositModel = require('../models/depositModel')
const userModel = require('../models/userModel')


exports.bankDeposit = async (req, res) => {
  try {
    const id = req.user.userId
    const { amount, bankDetails } = req.body

    const user = await userModel.findById(id)
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
    })
}

    if(!amount){
        return res.status(404).json({ 
            message: 'enter amount' 
        })
    }

    if (!bankDetails || !bankDetails.bankName || !bankDetails.BankAcct || !bankDetails.BVN) {
      return res.status(400).json({
        message: '(bankName, BankAcct, BVN) are all required'
      });
    }

    // Create new deposit instance
    const deposit = new depositModel({
      user: id,
      amount,
      bankDetails
    })

    if (deposit) {
      user.acctBalance += amount 
      await user.save()
        deposit.status = 'completed'
    } else {
      deposit.status = 'failed'
    }

    await deposit.save()

    return res.status(201).json({ 
        message: 'successfull',
        deposit 
    })
  } catch (error) {
    res.status(500).json({
        error: error.message
     })
  }
}

exports.cardDeposit = async (req, res) => {
    try {
      const id = req.user.userId
      const { amount, cardDetails } = req.body
  
      // Find the user by ID
      const user = await userModel.findById(id)
      if (!user) {
        return res.status(404).json({ 
          message: 'User not found' 
      })
      }
  
      if(!amount){
        return res.status(404).json({ 
            message: 'enter amount' 
        })
    }

    if (!cardDetails || !cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.pin) {
      return res.status(400).json({
        message: '(cardNumber, expiryDate, cvv, pin) are all required'
      });
    }

      // Create new deposit instance
      const deposit = new depositModel({
        user: id,
        amount,
        cardDetails
      })
  
      if (deposit) {
        user.acctBalance += amount 
        await user.save()
        deposit.status = 'completed'

      } else {
        deposit.status = 'failed'
      }
  
      await deposit.save()
  
      return res.status(201).json({ 
          message: 'successfull',
          deposit 
      })
    } catch (error) {
      res.status(500).json({
          error: error.message
       })
    }
  }