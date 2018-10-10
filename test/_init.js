const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false)

const config = require('../config');
const logger = require('../utils/logger');

before(function (done) {
  mongoose.Promise = global.Promise;

  const connection = mongoose.connect(config.database.mongodb, {
    useNewUrlParser: true
  });

  connection
    .then(db => {
      logger.info(`Successfully connected to ${config.database.mongodb} MongoDB cluster in ${config.env} mode.`);
      done();
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
});

after(function (done) {
  mongoose.connection.close(function () {
    logger.info('mongoose close');
    //process.exit(0);
    done();
  });
});