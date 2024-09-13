const router = require("express").Router()

const { cardDeposit, bankDeposit } = require("../controllers/depositController")

const authenticate = require("../auth/userAuth")

router.post("/deposit/bank", authenticate, bankDeposit)
router.post("/deposit/card", authenticate, cardDeposit)

module.exports = router