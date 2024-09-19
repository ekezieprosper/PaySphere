const userModel = require("../models/userModel")
const adminModel = require("../models/adminModel")
const OTPModel = require('../models/otpModel')
const cloudinary = require("../media/cloudinary")
const parsePhoneNumber = require('libphonenumber-js')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const fs = require("fs")
require("dotenv").config()
const sendUniqueID = require("../Emails/userUniqueID")
const sendEmail = require("../Emails/email")
const { resetFunc } = require("../Emails/resetPasswordEmail")


exports.signUp_user = async (req, res) => {
    try {
      const { firstName, lastName, email, countryCode, phoneNumber, password, confirmPassword } = req.body
  
      // Phone number validation
      if (!phoneNumber || !countryCode) {
        return res.status(400).json({
          error: "Country code and phone number are required."
        })
      }
  
      const PhoneNumber = `${countryCode}${phoneNumber}`
      const validNumber = parsePhoneNumber(PhoneNumber)
      if (!validNumber.isValid()) {
        return res.status(400).json({
          error: "Invalid phone number."
        })
      }
  
      // Check if passwords match
      if (password !== confirmPassword) {
        return res.status(400).json({
          error: "Passwords do not match."
        })
      }

      const maxEmailUsage = await userModel.findOne({email})
      if (maxEmailUsage) {
          if (maxEmailUsage.emailCount >= 3) {
            return res.status(400).json({ 
              message: 'This email has been used multiple times' 
          })
          }

          // Increment email usage count and save
          maxEmailUsage.emailCount += 1
          await maxEmailUsage.save()
        }
  
      // Encrypt the password
      const salt = bcrypt.genSaltSync(10)
      const hashPassword = bcrypt.hashSync(password, salt)
  
      // Generate a walletID for the user
      const trimmedUserName = firstName.slice(0, 2)
      const walletID = `${trimmedUserName.toLowerCase()}${Math.floor(Math.random() * 100000000)}`.padStart(8, '0');

  
      // Create the user in the database
      const user = await userModel.create({
        firstName:firstName.toLowerCase().charAt(0).toUpperCase() + firstName.slice(1),
        lastName:lastName.toLowerCase().charAt(0).toUpperCase() + lastName.slice(1),
        phoneNumber: PhoneNumber,
        password: hashPassword,
        walletID,
        email: email.toLowerCase(),
        emailCount: 1
      })
  
      if (!user) {
        return res.status(400).json({
          error: "An error occurred while creating the account."
        })
      }
  
      await sendUniqueID(user, walletID)
  
      return res.status(201).json(user)
  
    } catch (error) {
      return res.status(500).json({
        error: error.message
      })
    }
  }
  

exports.logIn = async (req, res) => {
    try {
      const { walletID, password } = req.body
  
      const user = await userModel.findOne({walletID})
      if (!user) {
        return res.status(404).json({
          error: `User with wallet ID "${walletID}" was not found.`
        })
      }
  
      // Compare the provided password with the hashed password in the database
      const checkPassword = await bcrypt.compare(password, user.password)
      if (!checkPassword) {
        return res.status(400).json({
          error: "Incorrect password."
        })
      }
  
      // Check if user has been suspended
      const admin = await adminModel.findOne({ suspended: user._id })
      if (admin) {
        return res.status(403).json({
          message: "This account has been suspended."
        })
      }
  
    //   verify the user
      if (!user.verified) {
        user.verified = true
        await user.save()
      }
  
      // Generate a token for the user
      const token = jwt.sign({
        userId: user._id,
        walletID: user.walletID, 
        lastName: user.lastName
    }, process.env.jwtkey, { expiresIn: '2d' })

  
      res.status(200).json({
        message: "Login successful.",
        user,
        token
      })
    } catch (error) {
      res.status(500).json({
        error: error.message
      })
    }
  }


exports.createTransactionPin = async(req, res)=>{
    try {
        const id = req.user.userId
        const {pin} = req.body

        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({
                error: "user not found"
            })
        }

        // Encrypt the pin
       const salt = bcrypt.genSaltSync(10)
       const hashPin = bcrypt.hashSync(pin, salt)

       user.pin = hashPin
       await user.save()

       return res.status(200).json(user.pin)

    } catch (error) {
        return res.status(500).json({
            error: error.message
          })
    }
}
  

exports.logOut = async (req, res) => {
    try {
        const hasAuthorization = req.headers.authorization

        if (!hasAuthorization) {
            return res.status(401).json({
                error: "Authorization token not found",
            })
        }

        const token = hasAuthorization.split(" ")[1]
        if (!token) {
            return res.status(401).json({
                error: "Authorization token not found",
            })
        }

        const decodedToken = jwt.verify(token, process.env.jwtkey)

        const user = await userModel.findById(decodedToken.userId)
        if (!user) {
            return res.status(404).json({
                error: "User not found",
            })
        }

        const expiredToken = jwt.sign({
            userId: user._id,
            walletID: user.walletID, 
            lastName: user.lastName
        }, process.env.jwtkey, { expiresIn: '1sec' })

        res.status(200).json({
            message: "Logged out successfully",
            expiredToken
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}


exports.createProfileImg = async (req, res) => {
    try {
        const id = req.user.userId

        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({
                error: "User not found"
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

        // Update user profile image URL
        user.profileImg = result.secure_url
        await user.save()

        // Send success response
        res.status(200).json({
            profileImg: user.profileImg
        })

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}


exports.getOne = async(req, res)=>{
    try {
        const id = req.user.userId
        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({
                error: "user not found"
            })
        }

        res.status(200).json({
            user
        })

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}


exports.deleteProfileImg = async (req, res) => {
    try {
        const id = req.user.userId

        const user = await userModel.findById(id)
        if (user.profileImg) {
            const oldImage = user.profileImg.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(oldImage)
        }

        // Update profile image URL in the database to default
        user.profileImg = "https://i.pinimg.com/564x/76/f3/f3/76f3f3007969fd3b6db21c744e1ef289.jpg"
        await user.save()

        // Send success response
        res.status(200).json(user.profileImg)
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}


exports.changePassword = async (req, res) => {
    try {
        const id = req.user.userId

        const { currentPassword, newPassword, confirmPassword } = req.body

        if (!confirmPassword) {
            return res.status(400).json({
                error: "Confirm password."
            })
        }

        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            })
        }

        const checkPassword = await bcrypt.compare(currentPassword, user.password)
        if (!checkPassword) {
            return res.status(401).json({
                error: "Incorrect password"
            })
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                error: "Passwords do not match."
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        user.password = hashedPassword
        await user.save()

        return res.status(200).json({
            message: `new password is saved`
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}


exports.forgotPassword = async (req, res) => {
    try {
        const { id } = req.params
        const { email } = req.body

        const user = await userModel.findOne({ email, _id: id })
        if (!user) {
            return res.status(404).json({ 
                error: 'User not found' 
            })
        }

        // Generate 6-digit OTP
        const otp = `${Math.floor(Math.random() * 1000000)}`.padStart(6, '0')
        
        // hash OTP then save it to the database
        const salt = await bcrypt.genSalt(10)
        const hashedOtp = await bcrypt.hash(otp, salt)

        await OTPModel.create({
            userId: user._id,
            otp: hashedOtp
        })

        // Send email with OTP and verification link
        const name = `${user.firstName.toUpperCase()}`
        const Email = user.email
        const subject = `${otp} is your account recovery code`
        const verificationLink = `https://pronext.onrender.com/reset_password/${user._id}`

        // Make sure the resetFunc receives all necessary parameters correctly
        const html = resetFunc(name, verificationLink, otp, Email)
        await sendEmail({ email, subject, html })

        return res.status(200).json({
            message: "We've sent you an email"
        })
    } catch (error) {
        return res.status(500).json({ 
            error: error.message 
        })
    }
}


exports.resendRecoveryCode = async (req, res) => {
    try {
        const id = req.params.id

        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({
                error: "User not found."
            })
        }

        // Generate 6-digit OTP
        const otp = `${Math.floor(Math.random() * 1000000)}`.padStart(6, '0')

        // hash OTP then save it to the database
        const saltotp = bcrypt.genSaltSync(10)
        const hashedOtp = bcrypt.hashSync(otp, saltotp)

        // Save the hashed OTP in the OTPModel for verification
        await OTPModel.create({
            userId: user._id,
            otp: hashedOtp
        })

        // Send the OTP to the user's email
        const name = `${user.firstName.toUpperCase()}. ${user.lastName.slice(0,1).toUpperCase()}`
        const Email = user.email
        const subject =`${otp} is your account recovery code`
        const verificationLink = `https://pronext.onrender.com/reset_password/${user._id}`
        const html = resetFunc(name, verificationLink, otp, Email)
        await sendEmail({ email: user.email, subject, html })

        // return success response
        return res.status(200).json({
            message: "check your email address"
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}


exports.inpute_reset_code = async (req, res) => {
    try {
        const id = req.params.id
        const { otp } = req.body

        // Find the user by ID
        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({ 
                error: "User not found" 
            })
        }

        const otpRecord = await OTPModel.findOne({ userId: id })
        if (!otpRecord) {
            return res.status(404).json({
                 error: "OTP has expired" 
            })
        }

        // Compare the OTP from the request with the saved OTP
        const isMatch = await bcrypt.compare(otp, otpRecord.otp)
        if (!isMatch) {
            return res.status(400).json({ 
                error: "Invalid OTP" 
            })
        }

        // Delete the OTP record after successful verification
        await OTPModel.findByIdAndDelete(otpRecord._id)

        // Redirect the user to the reset password page
        return res.status(200).json({
            message: "reset password now"
        })
    } catch (error) {
        return res.status(500).json({
             error: error.message 
        })
    }
}


exports.resetPassword = async (req, res) => {
    try {
        const id = req.params.id

        const { newPassword, confirmPassword } = req.body

        if (!confirmPassword) {
            return res.status(400).json({
                error: "Confirm your password"
            })
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                error: "Passwords do not match"
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            })
        }

        user.password = hashedPassword
        await user.save()

        res.status(200).json({
            message: `new password is saved`
        })

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}


exports.deleteAccount = async (req, res) => {
    try {
        const id = req.user.userId

        const user = await userModel.findByIdAndDelete(id)
        if (!user) {
            return res.status(400).json({
                error: "Unable to delete account"
            })
        }

        // If the user had a profile image, delete it from Cloudinary
        if (user.profileImg) {
            const oldImage = user.profileImg.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(oldImage)
        }

        // Respond with a success message
        res.status(200).json({
            message: "Deleted successfully"
        })

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}