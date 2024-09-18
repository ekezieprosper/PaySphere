const DynamicEmail = (walletID, verificationLink, email) => {
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
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://res.cloudinary.com/da9fesl0x/image/upload/v1726019240/acvmwiignhgssxbst1bw.jpg" alt="PaySphere Logo">
        </div>
        <div class="content">
            <p>Thank you for joining PaySphere! We are delighted to have you on board. Our platform is designed to offer a range of payment solutions that make transactions seamless and efficient. Whether you’re making payments or selling products, we aim to provide a smooth and secure experience.</p>
            <p><b style="font-size: 16px; letter-spacing: 2px; color: #333;">This is your wallet ID${walletID}</b> is your unique ID for account access, and will also be required for both login and transactions. Click the button below to get started.</p>
        </div>
         <div style="text-align: center;">
                <a href="${verificationLink}" class="button" style="display: inline-block; padding: 8px 16px; background-color: blue; color: #ffffff; text-decoration: none; font-size: 14px; border-radius: 4px;">Get started</a>
            </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} PaySphere.ltd, 203 Muyibi Road</p>
            <p>This email was sent to <a href="mailto:${email}">${email}</a>. If you did not create an account with us, please ignore this message.</p>
        </div>
    </div>
</body>
</html>
    `;
}

module.exports = DynamicEmail;