const hbs = require('nodemailer-express-handlebars');
const path = require('path');

const sendMail = async (mailTransporter, options) => {
  try {
    return await mailTransporter.sendMail(options, function (err, info) {
      if (err) {
        throw err;
      } else {
        console.log('Message sent: ' + info.response);
        return true;
      }
    });
  } catch (error) {
    console.log('Cannot sendMail');
    throw error;
  }
};

const sendMailWithTemplate = async (mailTransporter, options) => {
  try {
    const handlebarOptions = {
      viewEngine: {
        extname: '.hbs',
        layoutsDir: path.resolve('./views/').toString(),
        defaultLayout: false,
        partialsDir: path.resolve('./views/').toString(),
        helpers: {
          numberFormat: function (number) {
            const formatter = new Intl.NumberFormat();
            return formatter.format(number);
          },
        },
      },
      viewPath: path.resolve('./views/').toString(),
      extName: '.hbs',
    };

    mailTransporter.use('compile', hbs(handlebarOptions));
    return await sendMail(mailTransporter, options);
  } catch (error) {
    console.log('Cannot sendMailWithTemplate');
    throw error;
  }
};

module.exports = { sendMail, sendMailWithTemplate };
