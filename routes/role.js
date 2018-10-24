const base = require('../controllers/controller.base');
const RoleModel = require('../models/role');
const permission = require('../utils/permission');

module.exports = app => {
  app.route('/roles')
    .get((req, res, next) => permission.isAllowed(req, res, next, 'get', '/roles'),
      (req, res, next) => base.list(req, res, next, RoleModel))
    .post((req, res, next) => base.post(req, res, next, RoleModel));
  app.route('/roles/:id')
    .get((req, res, next) => base.get(req, res, next, RoleModel))
    .put((req, res, next) => base.put(req, res, next, RoleModel))
    .delete((req, res, next) => base.delete(req, res, next, RoleModel));
};