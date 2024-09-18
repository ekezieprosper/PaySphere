const DynamicEmail = require("../Emails/emailIndex")
const sendEmail = require("../Emails/email")

const sendUniqueID = async (user, walletID) => {
    try {
        const subject = "Complete your account verification"
        const email = user.email
        const text = `Verify your account`
        const verificationLink = `https://paysphere.vercel.app/login`
        const html = DynamicEmail(walletID, verificationLink, email)

        await sendEmail({ email, subject, text, html })

    } catch (error) {
        console.log(`Failed to send email to ${user.email}: ${error.message}`)
        throw new Error("Failed to send verification email.") 
    }
}

module.exports = sendUniqueID