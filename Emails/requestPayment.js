const requestEmail = (name, amount, paymentLink, denyLink, Email) => {
    return `
   <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Welcome to PaySphere</title>
    <style>
        body, table, td, a {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            margin: 0;
            padding: 0;
        }
        table, td {
            border-collapse: collapse;
        }
        img {
            -ms-interpolation-mode: bicubic;
        }
        body {
            background-color: #f4f4f4;
            font-family: Arial, sans-serif;
            width: 100% !important;
            height: 100% !important;
        }
        .email-container {
            max-width: 600px;
            margin: auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header img {
            width: 120px;
            height: auto;
        }
        .header h1 {
            font-size: 20px; /* Smaller header text */
            color: #333333;
            margin-top: 10px;
        }
        .content {
            font-size: 14px; /* Smaller content text */
            color: #333333;
        }
        .content p {
            margin: 0 0 15px 0;
        }
        .unique-id {
            text-align: center;
            font-size: 20px; /* Smaller unique ID text */
            font-weight: bold;
            color: #28a745;
            margin: 20px 0;
        }
        .footer {
            font-size: 10px; /* Smaller footer text */
            color: #888888;
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e0e0e0;
        }
        .footer a {
            color: #888888;
            text-decoration: none;
        }
        .button-container {
            display: flex;
            justify-content: flex-start; /* Align buttons horizontally */
            gap: 5%; /* Spacing between buttons */
            margin-top: 15px;
        }
        .button {
            padding: 8px 16px; /* Reduced button padding */
            width: 100px; /* Reduced width */
            text-align: center;
            font-size: 14px; /* Reduced font size */
            border-radius: 4px;
        }
        .pay-button {
            background-color: blue;
            color: white;
            text-decoration: none;
        }
        .reject-button {
            background-color: red;
            color: white;
            text-decoration: none;
        }
    </style>
</head>
 <body>
            <div style="text-align: left;">
            <p>You've received a payment request from <b>${name}.</b></p>
            <p>Details of the Payment Request:</p>
            <p>Amount: ₦${amount}</p>
            <p>Sender: ${name}</p>
             </div>
             <p style="text-align: left; margin-top: 15px;">Click the link below to complete payment or deny</p>
            <div class="button-container">
                <a href="${paymentLink}" class="button pay-button">Pay Now</a>
                <a href="${denyLink}" class="button reject-button">Reject</a>
            </div>
             <p style="text-align: left; margin-top: 15px;">By clicking the link, the requested amount will automatically be deducted from your account and transferred</p>
            <p>to <b>${name}'s</b> account if you have sufficient funds.</p>
            <hr style="margin: 15px 0;">
            <footer style="text-align: center; color: #999; font-size: 10px;">
                <p>© ${new Date().getFullYear()} PaySphere.ltd, 203 Muyibi Road</p>
                <p>This message was sent to <a href="mailto:${Email}" style="color: #999;">${Email}</a>.</p>
            </footer>
        </div>
    </body>
</html>
    `;
}

module.exports = { requestEmail };
