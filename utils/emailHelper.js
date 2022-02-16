const nodemailer = require("nodemailer");

const emailHelper = async (mailOptions)=>{
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER, // generated ethereal user
          pass: process.env.SMTP_PASS, // generated ethereal password
        },
    });

    const message = {
        from: 'foo@example.com', // sender address
        to: mailOptions.email, // list of receivers
        subject: mailOptions.subject, // Subject line
        text: mailOptions.message, // plain text body
        //html: "<b>Hello world?</b>", // html body
      }
    await transporter.sendMail(message);
}

module.exports = emailHelper;