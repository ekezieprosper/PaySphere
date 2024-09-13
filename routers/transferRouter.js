const router = require("express").Router()

const { transferFunds } = require("../controllers/transferController")

const authenticate = require("../auth/userAuth")

router.post("/transfer", authenticate, transferFunds)

module.exports = router