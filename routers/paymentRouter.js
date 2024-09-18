const router = require("express").Router()

const { 
    creditWalletThroughBankDeposit,
    transferFromWalletToBank,
    peer2PeerPaymentTransaction,
    makePaymentWithUSSD, 
    requestForPayment,
    processPayment,
    denyPayment,
    getAllPaymentRequests,
    getOnePaymentRequest } = require("../controllers/paymentController")

const authenticate = require("../auth/userAuth")

router.post("/credit_wallet/bank", creditWalletThroughBankDeposit)
router.post("/transfer_to_bank", transferFromWalletToBank)
router.post("/create_request", authenticate, requestForPayment)
router.post("/approve/:paymentRequestId", processPayment)
router.post("/deny_request/:paymentRequestId", denyPayment)
router.get("/getAll_request",authenticate, getAllPaymentRequests)
router.get("/get_request/:requestedId",authenticate, getOnePaymentRequest)
router.post("/USSDpayment/transfer", makePaymentWithUSSD)
router.post("/transfer_to_user", peer2PeerPaymentTransaction)

module.exports = router

