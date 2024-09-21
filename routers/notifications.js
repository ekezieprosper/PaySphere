const router = require("express").Router()

const { 
        getAllUserNotifications, 
        getNotificationById, 
        deleteNotification } = require("../controllers/notificationContoller")

const authenticate = require("../auth/userAuth")


router.get('/notifications', authenticate, getAllUserNotifications)
router.get('/notifications/:notificationId', authenticate, getNotificationById)
router.delete('/notification/:notificationId', authenticate, deleteNotification)

module.exports = router