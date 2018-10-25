const permission = require('../utils/permission');

const base = require('../controllers/controller.base');
const PathModel = require('../models/path');

module.exports = app => {
  app.route('/paths')
    .get((req, res, next) => permission.isAllowed(req, res, next, 'get', '/paths'),
      (req, res, next) => base.list(req, res, next, PathModel))
    .post((req, res, next) => permission.isAllowed(req, res, next, 'post', '/paths'),
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
    .get((req, res, next) => permission.isAllowed(req, res, next, 'get', '/paths/:id'),
      (req, res, next) => base.get(req, res, next, PathModel))
    .put((req, res, next) => permission.isAllowed(req, res, next, 'put', '/paths/:id'),
      (req, res, next) => base.put(req, res, next, PathModel, {
        select: '-updatedAt -createdAt'
      }))
    .delete((req, res, next) => permission.isAllowed(req, res, next, 'delete', '/paths/:id'),
      (req, res, next) => base.delete(req, res, next, PathModel));
};