const router = require("express").Router()

const { signUp_user, logIn, logOut, createProfileImg, deleteProfileImg, deleteAccount, changePassword, resetPassword, resetCode, forgotPassword, getOne, createTransferPin, resendRecoveryCode } = require("../controllers/userController")

const {signUp, forgotValidation,changePasswordValidation, resetPasswordValidation, loginValidation, transferPinValidation} = require("../validations/validation")
const upload = require("../media/multer")
const authenticate = require("../auth/userAuth")

router.post('/signup', signUp, signUp_user)
router.post("/logIn", loginValidation, logIn)
router.post("/create_pin", authenticate, transferPinValidation, createTransferPin)
router.post("/logout", authenticate, logOut)
router.post('/profileImg', authenticate, upload.single('profileImg'), createProfileImg)
router.get('/get_user', authenticate, getOne)
router.delete('/delete/profileImg', authenticate, deleteProfileImg)
router.post('/forgot_password/:id',forgotValidation, forgotPassword)
router.post('/resend_recoveryCode/:id', resendRecoveryCode)
router.post('/recover/code/:id', resetCode)
router.post('/reset_password/:id',resetPasswordValidation, resetPassword)
router.put('/change_password', authenticate, changePasswordValidation, changePassword)
router.delete('/delete_account', authenticate, deleteAccount)


module.exports = router