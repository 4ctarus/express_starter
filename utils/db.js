const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

const config = require('../config');
const logger = require('./logger');

mongoose.Promise = global.Promise;

const connection = mongoose.connect(config.database.mongodb, {
  useNewUrlParser: true
});

connection
  .then(db => {
    logger.info(`Successfully connected to ${config.database.mongodb} MongoDB cluster in ${config.env} mode.`);
    return db;
  })
  .catch(err => {
    if (err.message.code === 'ETIMEDOUT') {
      logger.info('Attempting to re-establish database connection.');
      mongoose.connect(config.database.mongodb, {
        useNewUrlParser: true
      });
    } else {
      logger.error('Error while attempting to connect to database:');
      logger.error(err);
    }
  });

module.exports = connection;