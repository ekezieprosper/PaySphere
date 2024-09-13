const router = require("express").Router()

const { user2userTransfer, app2BankTransfer, makePaymentWithUSSD } = require("../controllers/transferController")

const authenticate = require("../auth/userAuth")

router.post("/transfer/app", authenticate, user2userTransfer)
router.post("/transfer/bank", authenticate, app2BankTransfer)
router.post("/USSDpayment/transfer", authenticate, makePaymentWithUSSD)

module.exports = router