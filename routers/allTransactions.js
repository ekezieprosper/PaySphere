const router = require("express").Router()

const { 
       getAllUserTransactions, 
       getTransactionById, 
       deleteTransaction } = require("../controllers/allTransactions")

const authenticate = require("../auth/userAuth")


router.get('/transactions', authenticate, getAllUserTransactions)
router.get('/transactions/:transactionId', authenticate, getTransactionById)
router.delete('/transaction/:transactionId', authenticate, deleteTransaction)

module.exports = router