const depositModel = require('../models/depositModel')
const userModel = require('../models/userModel')
const transactionHistories = require('../models/transactionHistories')



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

    if (amount < 100) {
      return res.status(400).json({
           error: "Amount must be between ₦100 and above." 
          })
  }

    if (!bankDetails || !bankDetails.bankName || !bankDetails.BankAcctNumber || !bankDetails.BVN) {
      return res.status(400).json({
        message: '(bankName, BankAcctNumber, BVN) are all required'
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
      deposit.status = 'completed'   
      
      const Teller = new transactionHistories({
      message: `Money in from ${bankDetails.bankName}`, 
      amountPaid: amount,
      recipient:`${user.uniqueID}`,
      receiptID: deposit._id
      })

      await Teller.save() 
      user.transactions.push(Teller._id)
      await user.save()
      
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
        deposit.status = 'completed'
        
        const Teller = new transactionHistories({
          message: `Money in from ${cardDetails.cardNumber}`, 
          amountPaid: amount,
          recipient:`${user.uniqueID}`,
          receiptID: deposit._id
        })
        
        await Teller.save() 
        user.transactions.push(Teller._id)
        await user.save()

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