const winston = require('winston');
const config = require('../config');
const debug = require('debug');

let logger;

if (!config.env || config.env == 'development') {
  console.error = debug('app:error');
  console.warn = debug('app:warn');
  console.info = debug('app:info');
  console.verbose = debug('app:verbose');
  console.debug = debug('app:debug');
  console.silly = debug('app:silly');
	logger = console;
} else {
  logger = winston.createLogger({
    transports: [
      new winston.transports.File(
        {
          level: 'debug',
          filename: './logs/debug.log',
          handleExceptions: true,
          json: true,
          maxsize: 5242880, //5MB
          maxFiles: 5,
          colorize: true
        }
      )
    ]
  });
}

module.exports = logger;