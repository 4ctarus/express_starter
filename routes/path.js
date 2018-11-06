const permission = require('../utils/permission');

const base = require('../controllers/controller.base');
const PathModel = require('../models/path');

module.exports = app => {
  app.route('/paths')
    .get(permission.isAllowed('/paths'),
      base.list(PathModel))
    .post(permission.isAllowed('/paths'),
      (req, res, next) => {
        let data = req.body || {};
        delete data.createdAt;
        delete data.updatedAt;

        PathModel.findOneAndUpdate({
            path: data.path,
            method: data.method
          }, data, {
            upsert: true,
            new: true,
            runValidators: true
          }).then(result => {
            res.json(result);
          })
          .catch(err => {
            next(err);
          });
      });
  app.route('/paths/:id')
    .get(permission.isAllowed('/paths/:id'),
      base.get(PathModel))
    .put(permission.isAllowed('/paths/:id'),
      base.put(PathModel))
    .delete(permission.isAllowed('/paths/:id'),
      base.delete(PathModel));
};