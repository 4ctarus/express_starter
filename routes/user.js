const User = require('../controllers/user');

module.exports = app => {
  app.route('/users').get(User.list);
  app.route('/users/:userId')
    .get(User.get)
    .put(User.put)
    .delete(User.delete);
  app.route('/users/:userId/role')
    .put(User.setRole);
};