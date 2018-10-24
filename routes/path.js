const base = require('../controllers/controller.base');
const PathModel = require('../models/path');

module.exports = app => {
  app.route('/paths')
    .get((req, res, next) => base.list(req, res, next, PathModel))
    .post((req, res, next) => {
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
    .get((req, res, next) => base.get(req, res, next, PathModel, '-updatedAt -createdAt'))
    .put((req, res, next) => base.put(req, res, next, PathModel, {
      select: '-updatedAt -createdAt'
    }))
    .delete((req, res, next) => base.delete(req, res, next, PathModel));
};