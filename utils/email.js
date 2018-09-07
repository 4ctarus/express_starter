const nodemailer = require('nodemailer');
const log = require('./logger');
const config = require('../config');

const email = (mailOptions) => {
  log.debug(mailOptions);
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  nodemailer.createTestAccount((err, account) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: account.user, // generated ethereal user
        pass: account.pass // generated ethereal password
      }
    });

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return log.error(error);
      }
      log.debug('Message sent: %s', info.messageId);
      // Preview only available when sending through an Ethereal account
      log.debug('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
  });
}

class MailOptions {
  /**
   * 
   * @param {type: string, user: User, data: {}} data 
   */
  constructor(data) {
    this.from = `"🤖bipboup" <${config.email.sender.email}>`; // sender address
    this.to = data.user.email; // list of receivers

    switch (data.type) {
      case 'welcome':
        this.subject = `Welcome ${data.user.name} ✔`;
        this.text = `welcome ${data.user.name}`;
        this.html = `welcome`;
        break;

      default:
        this.subject = `default ${data.user.name} ✔`;
        this.text = `default ${data.user.name}`;
        this.html = `default`;
        break;
    }
  }
};

module.exports = {
  email: email,
  MailOptions: MailOptions
}