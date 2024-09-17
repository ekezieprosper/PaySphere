const router = require("express").Router()

const { requestPayment, processPayment, denyPayment, getOnePaymentRequest, getAllPaymentRequests } = require("../controllers/requestPaymentController")

const authenticate = require("../auth/userAuth")

router.post("/create_request", authenticate, requestPayment)
router.post("/approve/:paymentRequestId", processPayment)
router.post("/deny_request/:paymentRequestId", denyPayment)
router.get("/getAll_request",authenticate, getAllPaymentRequests)
router.get("/get_request/:requestedId",authenticate, getOnePaymentRequest)

module.exports = router