const userModel = require("../models/userModel")
const adminModel = require("../models/adminModel")
const sendMail = require("../Emails/suspendUser")
const unsuspendUser = require("../Emails/restoreUserAcct")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const fs = require("fs")
require("dotenv").config()
const cloudinary = require("../media/cloudinary")



exports.signUp = async (req, res) => {
    try {
        const { userName, gender, password, confirmPassword } = req.body

        if (!userName) {
            return res.status(400).json({
                error: `input userName`
            })
        }

        const searchUsername = await adminModel.findOne({ userName })
        if (searchUsername) {
            return res.status(403).json({
                error: `${userName} is taken.`
            })
        }

        if (userName.length < 4) {
            return res.status(400).json({
                error: `${userName} is weak.`
            })
        }

        if (!gender) {
            return res.status(400).json({
                error: `gender: male or female?`
            })
        }

        if (!password) {
            return res.status(400).json({
                error: `input your password`
            })
        }


        if (password.length < 5) {
            return res.status(400).json({
                error: `password is weak`
            })
        }

        if (confirmPassword !== password) {
            return res.status(400).json({
                error: `password does not match`
            })
        }

        const saltpass = bcrypt.genSaltSync(10)
        const hashpass = bcrypt.hashSync(password, saltpass)

        const admin = await adminModel.create({
            userName: userName.toLowerCase(),
            password: hashpass,
            gender
        })

        if (!admin) {
            return res.status(500).json({
                error: "error occured while creating this account."
            })
        }
        else {
            const token = jwt.sign({
                adminId: admin._id,
                userName: admin.userName
            }, process.env.jwtkey, { expiresIn: '9000000000000d' })

            return res.status(200).json({
                admin,
                token
            })
        }

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}


exports.ProfileImgage = async (req, res) => {
    try {
        const id = req.admin.adminId

        const admin = await adminModel.findById(id)
        if (!admin) {
            return res.status(404).json({
                error: "admin not found"
            })
        }

        // Validate file upload
        const file = req.file
        if (!file || !file.path) {
            return res.status(400).json({
                error: "File upload is required"
            })
        }

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, { resource_type: 'image' })

        // Delete the file from local storage
        fs.unlink(file.path, (err) => {
            if (err) {
                console.error('Failed to delete local file', err)
            }
        })

        // Update admin profile image URL
        admin.profileImg = result.secure_url
        await admin.save()

        // Send success response
        res.status(200).json({
            profileImg: admin.profileImg
        })

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const id = req.admin.adminId
        const admin = await adminModel.findById(id)
        if (!admin) {
            return res.status(404).json({
                error: "admin not found"
            })
        }

        const users = await userModel.find()
        if (!users || users.length === 0) {
            return res.status(404).json({
                error: "no user available yet"
            })
        } else {
            res.status(200).json({
                total_users: users.length,
                users
            })
        }
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}


exports.suspendUser = async (req, res) => {
    try {
        const adminId = req.admin.adminId
        const id = req.params.id
        const admin = await adminModel.findById(adminId)

        if (!admin) {
            return res.status(404).json({
                error: "admin not found"
            })
        }

        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({
                error: "user not found"
            })
        }

        // Check if the user has already been suspended
        if (admin.suspended.includes(id)) {
            return res.status(400).json({
                error: "account is already suspended"
            })
        }

        // Suspend the user
        admin.suspended.push(id)
        await admin.save()

        await sendMail(user)

        return res.status(200).json({
            message: "suspended"
        })

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}


exports.getAllSuspendedUsers = async (req, res) => {
    try {
        const id = req.admin.adminId

        const admin = await adminModel.findById(id)
        if (!admin) {
            return res.status(404).json({
                message: "admin not found."
            })
        }

        // Check if there are any notifications
        if (admin.suspended.length === 0) {
            return res.status(404).json({
                message: "No suspended user"
            })
        }else{
            res.status(200).json(admin.suspended)
        }
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}


exports.unSuspendUser = async (req, res) => {
    try {
        const adminId = req.admin.adminId
        const id = req.params.id
        const admin = await adminModel.findById(adminId)
        if (!admin) {
            return res.status(404).json({
                error: "admin not found"
            })
        }
        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({
                error: "user not found"
            })
        }

        // Check if the user has already been suspended
        const suspendedUser = admin.suspended.indexOf(id)
        if (suspendedUser !== -1) {
            // Remove the user's ID from the suspended array
            admin.suspended.splice(suspendedUser, 1)
        }

        await admin.save()
        await unsuspendUser(user)

        return res.status(200).json({
            message: "Unsuspended"
        })

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}


exports.deleteUser = async (req, res) => {
    try {
        const adminId = req.admin.adminId
        const admin = await adminModel.findById(adminId)
        if (!admin) {
            return res.status(404).json({
                message: "Admin not found"
            })
        }

        const id = req.params.id
        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        // Delete the user's profile image if it exists
        if (user.profileImg) {
            const oldImage = user.profileImg.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(oldImage)
        }

        // Delete the user's account
        const deleteAcct = await userModel.findByIdAndDelete(id)
        if (!deleteAcct) {
            return res.status(400).json({
                error: "Unable to delete account"
            })
        }

        res.status(200).json({
            message: "deleted"
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}