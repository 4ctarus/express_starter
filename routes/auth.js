const Auth = require('../controllers/auth');
const User = require('../controllers/user');

module.exports = app => {
  app.route('/auth').post(Auth.login);
  app.route('/auth/signup').post(User.post);
};