const DynamicEmail = require("../Emails/emailIndex")
const sendEmail = require("../Emails/email")

const sendUniqueID = async (user, uniqueID) => {
    try {
        const subject = "Complete your account verification"
        const email = user.email
        const text = `Use this unique ID for both payment and login to your account: ${uniqueID}`
        const verificationLink = `https://pronext.onrender.com/logIn`
        const html = DynamicEmail(uniqueID, verificationLink, email)

        await sendEmail({ email, subject, text, html })

    } catch (error) {
        console.log(`Failed to send email to ${user.email}: ${error.message}`)
        throw new Error("Failed to send verification email.") 
    }
}

module.exports = sendUniqueID