const log = require('../utils/logger');
const PathModel = require('../models/path');
const {
  hsetSync,
  hgetAsync,
  hgetallAsync
} = require('./redis_util');

exports.init = () => {
  PathModel.find({}, function (err, paths) {
    log.info('Server init permissions');

    paths.forEach(path => {
      path.role.forEach(role => {
        hsetSync(`perm:${path.method}:${role}`, path.path, 1);
      });
    });
  });
};

exports.add = () => {

};

exports.isAllowed = (path) => {
  return (req, res, next) => {
    const method = req.method.toLowerCase();
    const role = req.user.role;
    hgetallAsync(`perm:${method}:${role}`).then(function (result) {
      log.debug('actual user permissions', result);
    }).catch(err => {
      log.error(err);
      return next(err);
    });

    hgetAsync(`perm:${method}:${role}`, path).then(function (res) {
      if (!res) {
        let err = new Error('Forbidden');
        err.name = 'Forbidden'
        next(err);
      } else {
        next();
      }
    }).catch(err => {
      log.error(err);
      return next(err);
    });
  }
};