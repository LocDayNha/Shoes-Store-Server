const nodemailer = require('nodemailer');

const gmailTransporter = nodemailer.createTransport({
  pool: true,
  host: process.env.GMAIL_SMTP_HOST,
  port: process.env.GMAIL_SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.GMAIL_SMTP_USER,
    pass: process.env.GMAIL_SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
});

module.exports = {
  gmailTransporter,
};
