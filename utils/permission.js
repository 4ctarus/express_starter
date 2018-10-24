const PathModel = require('../models/path');
const {
  hsetSync,
  getAsync,
  hkeysAsync
} = require('./redis_util');

exports.init = () => {
  PathModel.find({}, function (err, paths) {
    console.log(paths);

    paths.forEach(path => {
      path.role.forEach(role => {
        hsetSync(path.method + ':' + path.path + ':' + role, '', '1');
      });
    });
  });
};

exports.add = () => {

};

exports.isAllowed = (req, res, next, method, path) => {
  hkeysAsync('*').then(function (res) {
    console.log('perm', res);
  });

  let err = new Error('Forbidden');
  err.name = 'Forbidden'
  return next(err);

  const role = req.user.role;
  getAsync(method + ':' + path + ':' + role).then(function (res) {
    console.log(res);
    if (!res) {
      let err = new Error('Forbidden');
      err.name = 'Forbidden'
      next(err);
    } else {
      next();
    }
  }).catch(err => {
    console.log('err', err);
    return next(err);
  });
};