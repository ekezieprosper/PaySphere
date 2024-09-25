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
    getOnePaymentRequest, 
    sendMoneyViaEmail,
    creditUser,
    debitUser,
    treasuryPercentage} = require("../controllers/paymentController")

const authenticate = require("../auth/userAuth")
const {payment} = require("../validations/validation")

router.post("/credit_wallet/bank", authenticate, creditWalletThroughBankDeposit)
router.post("/transfer_to_bank", authenticate, transferFromWalletToBank)
router.post("/credit/user", creditUser)
router.post("/debit/user", debitUser)
router.post("/treasury/percentage", treasuryPercentage)
router.post("/send_money_via_email", authenticate, payment, sendMoneyViaEmail)
router.post("/request_payment", authenticate, requestForPayment)
router.post("/approve/:paymentRequestId", processPayment)
router.post("/deny/:paymentRequestId", denyPayment)
router.get("/get_all_payment_request",authenticate, getAllPaymentRequests)
router.get("/get_request/:requestedId",authenticate, getOnePaymentRequest)
router.post("/USSDpayment/transfer", makePaymentWithUSSD)
router.post("/transfer_to_user", authenticate, peer2PeerPaymentTransaction)

module.exports = router