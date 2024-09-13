const resetFunc = (userName, verificationLink, otp, Email) => {
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
       <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 10px;">
                <img src="https://res.cloudinary.com/da9fesl0x/image/upload/v1724452088/pj2mmfdp9conop8774ct.jpg" alt="Pronext Logo" width="156" height="100">
                <div style="text-align: center; margin-bottom: 15px;">
            </div>
            <div style="text-align: left;">
            <p>We received a request to reset the password for your account <b>${userName}.</b></p>
            <p>Enter this opt code, do not share.</p>
             </div>
             <h2 style="text-align: left; font-size: 28px; letter-spacing: 5px; color: #333;">${otp}</h2>
             <p style="text-align: left; margin-top: 15px;">Alternatively, you can directly reset your password</p>
            <div style="text-align: left;">
                <a href="${verificationLink}" class="button" style="display: inline-block; padding: 8px 16px; width: 250px; text-align: center; background-color: green; color: #ffffff; text-decoration: none; font-size: 14px; border-radius: 4px;">Reset Password</a>
            </div>
            <hr style="margin: 15px 0;">
            <footer style="text-align: center; color: #999; font-size: 10px;">
                <p>© ${new Date().getFullYear()} Pronext. 203 Muyibi Road</p>
                <p>This message was sent to <a href="mailto:${Email}" style="color: #999;">${Email}</a>.</p>
            </footer>
        </div>
    </body>
</html>
    `;
}

module.exports = {resetFunc};