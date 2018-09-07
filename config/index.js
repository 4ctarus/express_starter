require('dotenv').load();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  protocol: process.env.PROTOCOL || 'http',
  host: process.env.HOST || '127.0.0.1',
  port: process.env.PORT || '3000',

  saltrounds: parseInt(process.env.SALTROUNDS) || 10,

  database: {
    mongodb: process.env.MONGODB || 'mongodb://localhost:27017/express_starter',
    redis: process.env.REDIS || 'redis://localhost:6379'
  },

  email: {
    sender: {
      name: process.env.EMAIL_SENDER_NAME || 'test_name',
      email: process.env.EMAIL_SENDER_EMAIL || 'test@test.fr'
    }
  }
};