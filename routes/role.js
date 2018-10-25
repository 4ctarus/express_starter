const permission = require('../utils/permission');

const base = require('../controllers/controller.base');
const RoleModel = require('../models/role');

module.exports = app => {
  app.route('/roles')
    .get(
      permission.isAllowed('/roles'),
      base.list(RoleModel))
    .post(
      permission.isAllowed('/roles'),
      base.post(RoleModel));
  app.route('/roles/:id')
    .get(
      permission.isAllowed('/roles/:id'),
      base.get(RoleModel))
    .put(
      permission.isAllowed('/roles/:id'),
      base.put(RoleModel))
    .delete(
      permission.isAllowed('/roles/:id'),
      base.delete(RoleModel));
};