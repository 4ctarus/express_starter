const config = require('../config');
const client = require('redis').createClient(config.database.redis);

client.on("error", function (err) {
  log.error("Error " + err);
});

module.exports = app => {
  const limiter = require('express-limiter')(app, client);
  const auth_default_options = {
    lookup: ['connection.remoteAddress'],
    // 10 requests per minute
    total: 2,
    expire: 1000 * 60,
    skipHeaders: true,
    onRateLimited: function (req, res, next) {
      res.status(429).json({
        msg: 'rate_limit'
      })
    }
  };

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