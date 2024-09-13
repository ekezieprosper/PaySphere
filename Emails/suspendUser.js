const deleteMail = require("../Emails/suspendEmail");
const sendEmail = require("../Emails/email")

const sendMail = async (user) => {
    try {
        const user = user
        if (!user) throw new Error("user not found")

        // Prepare email content
        const subject = `Your account has been suspended`
        const userName = user.userName
        const email = user.email
        const supportTeam = `elitefootball234@gmail.com`

        const html = deleteMail(userName, supportTeam, email)

        await sendEmail({ email, subject, html, text: subject }) 
    } catch (error) {
        console.error( error.message)
    }
}

module.exports = sendMail