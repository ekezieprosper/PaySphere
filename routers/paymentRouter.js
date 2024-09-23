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
    QRcodePaymentDeposit,
    QRcodePaymentTransfer} = require("../controllers/paymentController")

const authenticate = require("../auth/userAuth")
const {payment} = require("../validations/validation")

router.post("/credit_wallet/bank", authenticate, creditWalletThroughBankDeposit)
router.post("/transfer_to_bank", authenticate, transferFromWalletToBank)

router.post("/qrcode/deposit", QRcodePaymentDeposit)
router.post("/qrcode/transfer", QRcodePaymentTransfer)

router.post("/send_money_via_email", authenticate, payment, sendMoneyViaEmail)
router.post("/request_payment", authenticate, requestForPayment)
router.get("/approve/:paymentRequestId", processPayment)
router.get("/deny/:paymentRequestId", denyPayment)
router.get("/get_all_payment_request",authenticate, getAllPaymentRequests)
router.get("/get_request/:requestedId",authenticate, getOnePaymentRequest)
router.post("/USSDpayment/transfer", makePaymentWithUSSD)
router.post("/transfer_to_user", authenticate, peer2PeerPaymentTransaction)

module.exports = router