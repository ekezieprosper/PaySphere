const notificationModel = require("../models/notificationModel")
const userModel = require("../models/userModel")


exports.getAllUserNotifications = async (req, res) => {
    try {
        const id = req.user.userId

        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({
                message: "User not found."
            })
        }

        // Retrieve all notifications for the user
        const notifications = await notificationModel.find({ recipient: id })
        if (notifications.length === 0) {
            return res.status(404).json({
                message: "You don't have any notifications yet."
            })
        }

        // Return the notifications
        res.status(200).json(notifications)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}


exports.getNotificationById = async (req, res) => {
    try {
        const id = req.user.userId
        const { notificationId } = req.params

        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({
                message: "User not found."
            })
        }

        // Check if the notification exists and is in the user's notifications field
        const notification = await notificationModel.findOne({ _id: notificationId, recipient: id })
        if (!notification) {
            return res.status(404).json({
                message: "Only owner can access this notification"
            })
        }

        // Return the single notification
        res.status(200).json(notification)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}


exports.deleteNotification = async (req, res) => {
    try {
        const id = req.user.userId
        const { notificationId } = req.params

        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({
                 error: "User not found" 
                })
        }

        const notification = await notificationModel.findOne({ _id: notificationId, recipient: id })
        if (!notification) {
            return res.status(404).json({
           message: "Unauthorized"
          })
        } 

        const deleteNotification = await notificationModel.findByIdAndDelete(notificationId)

        if (!deleteNotification) {
            return res.status(404).json({
                 error: "Notification not found" 
                })
        }

        // Remove the notification ID from the user notifications array
        const indexNotification = user.notifications.indexOf(notificationId)

        if (indexNotification !== -1) {
            user.notifications.splice(indexNotification, 1)
            await user.save()
        }

        return res.status(200).json({
             message: "Deleted"
             })

    } catch (error) {
        return res.status(500).json({
             message: error.message 
            })
    }
}