const redis = require("redis");
const {promisify} = require('util');
const config = require('../config');
const log = require('./logger');

const client = redis.createClient(config.database.redis);

client.on("error", function (err) {
  log.error("Error " + err);
});

exports.hsetSync = client.hset.bind(client);
exports.hmsetASync = promisify(client.HMSET).bind(client);
exports.hgetAsync = promisify(client.hget).bind(client);
exports.hgetallAsync = promisify(client.hgetall).bind(client);

exports.setexAsync = promisify(client.setex).bind(client);