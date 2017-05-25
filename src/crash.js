const nodemailer = require('nodemailer');
require('dotenv').config({path: '../.env'});

const {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_SECURE,
  EMAIL_FROM,
  PASS,
  EMAIL_TO,
} = process.env;

const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: MAIL_SECURE,
  auth: {
    user: EMAIL_FROM,
    pass: PASS
  }
});

process.on('uncaughtException', (systemError) => {
  if (!EMAIL_FROM) return;

  const mailOptions = {
    from: `"Crash Reporter" <${EMAIL_FROM}>`,
    to: EMAIL_TO,
    subject: `[LinguaCode Core] error: ${systemError.code}: ${systemError.message}`,
    html: `
        <b>Code:</b><br/>${systemError.code}<br/><br/>
        <b>Message:</b><br/>${systemError.message}<br/><br/>
        <b>Stack:</b><br/>${systemError.stack.replace(/\n/ig, '<br/>')}
        <br/><br/>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
  });
});