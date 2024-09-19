const resetFunc = (name, verificationLink, otp, Email) => {
    return `
   <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Password Reset - PaySphere</title>
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
        .otp {
            text-align: center;
            font-size: 17px;
            letter-spacing: 5px;
            color: #333;
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
            color: #ffffff;
            text-decoration: none;
            font-size: 14px;
            border-radius: 4px;
            margin: 20px 0;
            width: 60%;
            max-width: 250px;
            text-align: center;
        }
        
        /* Responsive design */
        @media screen and (max-width: 600px) {
            .email-container {
                padding: 10px;
            }
            .header h1 {
                font-size: 18px;
            }
            .content {
                font-size: 12px;
            }
            .otp {
                font-size: 22px;
                letter-spacing: 4px;
            }
            .button {
                font-size: 12px;
                padding: 6px 12px;
                max-width: 200px;
            }
            .footer {
                font-size: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Password Reset</h1>
        </div>
        <div class="content">
            <p>Hello <b>${name}</b>,</p>
            <p>We received a request to reset your account password.</p>
            <p>Use the OTP code below to reset your password. Please do not share this code with anyone. The code will expire in 10 minutes:  ${otp}</p>
        </div>
        <p>Alternatively, you can directly reset your password by clicking the button below:</p>
        <div>
            <a href="${verificationLink}" class="button">Reset Password</a>
        </div>
        <hr style="margin: 15px 0;">
        <footer>
            <p>© ${new Date().getFullYear()} PaySphere.ltd. 203 Muyibi Road</p>
            <p>This message was sent to <a href="mailto:${Email}" style="color: #999;">${Email}</a>.</p>
        </footer>
    </div>
</body>
</html>
    `;
}

module.exports = { resetFunc };