const config = require('../config');
const client = require('redis').createClient(config.database.redis);
const log = require('./logger');

client.on("error", function (err) {
  log.error("Error " + err);
});

module.exports = app => {
  const limiter = require('express-limiter')(app, client);
  let auth_default_options = {
    lookup: ['connection.remoteAddress'],
    // 6 requests per minute
    total: 6,
    expire: 1000 * 60,
    skipHeaders: true,
    onRateLimited: function (req, res, next) {
      res.status(429).json({
        msg: 'rate_limit'
      })
    }
  };

  if (config.env === 'development') {
    auth_default_options = Object.assign(auth_default_options, {
      whitelist: function (req) {
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        return ip == config.host;
      }
    })
  }

  limiter(
    Object.assign({
      path: '/auth/',
      method: 'all',
    }, auth_default_options)
  );
  limiter(
    Object.assign({
      path: '/auth/*',
      method: 'all',
    }, auth_default_options)
  );

};