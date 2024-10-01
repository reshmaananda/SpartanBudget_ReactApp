const nodemailer = require('nodemailer');

exports.sendEmailHandler = async ({ recipients, subject, message }) => {
    // const { recipients, subject, message } = req.body;
    
    // Create a transporter object using SMTP transport
    let transporter = nodemailer.createTransport({
        service:'gmail',
        host: 'smtp.gmail.com',
        // service: "Outlook365",
        // host: 'smtp.office365.com',
        port: 587,
        secure:false,
        auth: {
            // user:'spartonbudget@outlook.com',
            // pass:'muteafevqaeatczl'
            // pass:'X6RDC-LTCJZ-GH4RS-8BYS4-YCUU8'
            user:'budgetsparton@gmail.com',
            pass:'epcr xuhb wbig ktds'
            
        }
    });

    // Set up email data
    let mailOptions = {
        from: 'spartonbudget@gmail.com',
        to: recipients, // array of email addresses
        subject: subject,
        text: message,
        html:`
        <html>
        <head>
            <style>
                .email-container {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }
                .header {
                    background-color: #f7f7f7;
                    padding: 20px;
                    text-align: center;
                    border-bottom: 1px solid #ddd;
                }
                .content {
                    padding: 20px;
                }
                .footer {
                    background-color: #f7f7f7;
                    padding: 10px;
                    text-align: center;
                    border-top: 1px solid #ddd;
                    font-size: 12px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>Spartan's Budget</h1>
                </div>
                <div class="content">
                    <p>Hello ${recipients},</p><br>
                    <p>We are excited to have you on board. Here's a quick update:</p>
                    <p>${message}</p><br>
                    <p>Thanks & Regards,</p>
                    <p>Spartans Budget Team</p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 Your Budget Spartans. All rights reserved.</p>
                    <p>If you have any questions, feel free to contact us at budgetsparton@gmail.com.</p>
                </div>
            </div>
        </body>
        </html>
    `
    };
    console.log(mailOptions);
    // Send mail with defined transport object
    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.log(error);
        return { success: false, error: error.message || error };
    }
};

// module.exports = { handler: sendEmailHandler };
