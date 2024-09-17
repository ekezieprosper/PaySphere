const router = require("express").Router()

const { peer2PeerPaymentTransaction, createApp2BankTransaction, makePaymentWithUSSD, proccessPeer2PeerPaymentTransaction, processBankTransaction } = require("../controllers/transferController")

const authenticate = require("../auth/userAuth")

router.post("/initialize_transaction/app", authenticate, peer2PeerPaymentTransaction)
router.post("/process_app_transaction", authenticate, proccessPeer2PeerPaymentTransaction)
router.post("/initialize_transaction/bank", authenticate, createApp2BankTransaction)
router.post("/process_bank_transaction", authenticate, processBankTransaction)
router.post("/USSDpayment/transfer", makePaymentWithUSSD)

module.exports = router