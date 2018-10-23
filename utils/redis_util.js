const redis = require("redis");
const {promisify} = require('util');
const config = require('../config');
const log = require('./logger');

const client = redis.createClient(config.database.redis);

client.on("error", function (err) {
  log.error("Error " + err);
});

exports.getAsync = promisify(client.get).bind(client);
exports.setSync = client.set.bind(client);