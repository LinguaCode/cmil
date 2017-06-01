const nodemailer = require('nodemailer');
const moment = require('moment');
const getter = require('../executer/getter');

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

  const now = moment().format('MMMM Do YYYY, h:mm:ss a');

  const sessionId = systemError.message;
  const data = getter.data(sessionId);

  let content;
  if (data) {
    const {
      structure,
      pathOfLocation,
      input,
      output,
      status,
      sourceCode,
      ip,
      language,
      variables
    } = data;

    content = {
      subject: `[LinguaCode Core] known error: ${systemError.code}: ${systemError.message}`,
      html: `
        ${paramHTML('Date', now)}
        ${paramHTML('User', ip)}
        ${paramHTML('Language', language)}
        ${paramHTML('Source code', sourceCode)}
        ${paramHTML('Variables', variables)}
        ${paramHTML('Status', status)}
        ${paramHTML('Output', output)}
        ${paramHTML('Input', input)}
        ${paramHTML('Path of location', pathOfLocation)}
        ${paramHTML('Structure', structure)}
    `
    }
  } else {
    content = {
      subject: `[LinguaCode Core] known error: ${systemError.code}: ${systemError.message}`,
      html: `
        ${paramHTML('Date', now)}
        ${paramHTML('Code', systemError.code)}
        ${paramHTML('Message', systemError.message)}
        ${paramHTML('Stack', systemError.stack)}
    `
    }
  }

  const mailOptions = Object.assign({}, {
    from: `"Crash Reporter" <${EMAIL_FROM}>`,
    to: EMAIL_TO,
  }, content);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
  });
});

const paramHTML = (title, value = '') => {
  return `<b>${title}:</b>${/\n/.test(value) ? '<br/>' : ' '}${value.replace(/\n/ig, '<br/>')}<br/><br/>`;
};