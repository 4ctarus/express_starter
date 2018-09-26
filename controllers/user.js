const validator = require('validator');
const admin = require('firebase-admin');

const log = require('../utils/logger');

exports.list = (req, res) => {
  const query = req.query || {};

  const pageToken = parseInt(query.pageToken, 10)
  const perPage = parseInt(query.per_page, 10) || 10;

  if (pageToken) {
    var getList = admin.auth().listUsers(perPage, pageToken);
  } else {
    var getList = admin.auth().listUsers(1000);
  }

  getList.then(function (listUsersResult) {
      res.json(listUsersResult);
    })
    .catch(function (error) {
      log.error(error);
      res.status(500).json({
        msg: 'users_get_500'
      });;
    });
};

exports.get = (req, res) => {
  admin.auth().getUser(req.params.userId)
    .then(function (userRecord) {
      res.json(userRecord.toJSON());
    })
    .catch(function (error) {
      log.error(error);
      res.status(500).json({
        msg: 'user_get_500'
      });
    });
};

exports.put = (req, res) => {
  const data = req.body || {};
  delete data.email;
  delete data.password;

  admin.auth().updateUser(req.params.userId, {
      phoneNumber: data.phoneNumber,
      displayName: data.name,
      photoURL: "http://www.example.com/12345678/photo.png",
    })
    .then(function (userRecord) {
      res.json(userRecord.toJSON());
    })
    .catch(function (error) {
      log.error(error);
      res.status(500).json({
        msg: 'user_put_500'
      });
    });
};

exports.post = (req, res) => {
  let lang = 'en';
  if (req.headers["accept-language"].includes('fr')) {
    lang = 'fr';
  }

  admin.auth().createUser({
      email: req.body.email,
      emailVerified: false,
      phoneNumber: req.body.phoneNumber,
      password: req.body.password,
      displayName: req.body.name,
      photoURL: "http://www.example.com/12345678/photo.png",
      disabled: false
    })
    .then(function (userRecord) {
      // save some param on local db maybe remove this 
      res.json(userRecord.toJSON());

    })
    .catch(function (error) {
      log.error(error);
      res.status(500).json({
        msg: 'user_post_500'
      });
    });
};

exports.delete = (req, res) => {
  admin.auth().deleteUser(req.params.userId)
    .then(function () {
      res.status(204).json({});
    })
    .catch(function (error) {
      log.error(error);
      res.status(500).json({
        msg: 'user_delete_500'
      });
    });
};