require('dotenv').load();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  protocol: process.env.PROTOCOL || 'http',
  port: process.env.PORT,
  host: process.env.HOST,

  saltrounds: parseInt(process.env.SALTROUNDS) || 10,

  database: {
    uri: process.env.MONGODB,
  },

  email: {
    sender: {
      name: process.env.EMAIL_SENDER_NAME,
      email: process.env.EMAIL_SENDER_EMAIL
    },
    oneSignal: {
      secret: process.env.EMAIL_ONESIGNAL_SECRET, // OneSignal API Secret
    },
  }
};