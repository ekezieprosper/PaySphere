const DynamicEmail = (name, walletID, verificationLink, email) => {
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
            font-size: 20px;
            color: #333333;
            margin-top: 10px;
        }
        .content {
            font-size: 14px;
            color: #333333;
        }
        .content p {
            margin: 0 0 15px 0;
        }
        .unique-id {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            color: #28a745;
            margin: 20px 0;
        }
        .footer {
            font-size: 10px;
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
        .button {
            display: inline-block;
            padding: 8px 16px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            font-size: 14px;
            border-radius: 4px;
            text-align: center;
        }
        
        /* Media Queries for mobile responsiveness */
        @media screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                padding: 10px;
            }
            .content p, .footer {
                font-size: 12px;
            }
            .header h1 {
                font-size: 16px;
            }
            .unique-id {
                font-size: 16px;
            }
            .button {
                padding: 8px 16px;
                font-size: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
       <h4>Hi ${name},</h4>
        <div class="content">
            <p>Thank you for joining PaySphere! We’re excited to have you on board. Our platform offers a variety of payment solutions designed to make transactions seamless and efficient. Whether you’re making payments or selling products, we aim to provide a smooth, secure experience.</p>
            <p>Your wallet ID is: <b style="font-size: 16px; color: #333;">${walletID}</b>. You’ll need this ID to access your account and some other transactions.</p>
            <p>Click the button below to get started:</p>
            <a href="${verificationLink}" class="button">Get started</a>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} PaySphere.ltd, 203 Muyibi Road</p>
            <p>This email was sent to <a href="mailto:${email}">${email}</a>. If you did not create an account with us, please ignore this message.</p>
        </div>
    </div>
</body>
</html>
    `
}

module.exports = DynamicEmail