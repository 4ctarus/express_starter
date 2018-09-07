const validator = require('validator');

const User = require('../models/user');
const log = require('../utils/logger');

exports.list = (req, res) => {
  const params = req.params || {};
  const query = req.query || {};

  const page = parseInt(query.page, 10) || 0;
  const perPage = parseInt(query.per_page, 10) || 10;

  User.apiQuery(req.query)
    .select('name email username')
    .then(users => {
      res.json(users);
    })
    .catch(err => {
      log.error(err);
      res.status(422).send(err.errors);
    });
};

exports.get = (req, res) => {
  User.findById(req.params.userId)
    .then(user => {
      res.json(user);
    })
    .catch(err => {
      log.error(err);
      res.status(422).send(err.errors);
    });
};

exports.put = (req, res) => {
  const data = req.body || {};

  if (data.email && !validator.isEmail(data.email)) {
    return res.status(422).send('Invalid email address.');
  }

  if (data.username && !validator.isAlphanumeric(data.username)) {
    return res.status(422).send('Usernames must be alphanumeric.');
  }

  User.findByIdAndUpdate({
      _id: req.params.userId
    }, data, {
      new: true
    })
    .then(user => {
      if (!user) {
        return res.sendStatus(404);
      }

      user.password = undefined;
      user.recoveryCode = undefined;

      res.json(user);
    })
    .catch(err => {
      log.error(err);
      res.status(422).send(err.errors);
    });
};

exports.post = (req, res) => {
  let lang = 'en';
  if (req.headers["accept-language"].includes('fr')) {
    lang = 'fr';
  }
  const data = Object.assign({}, req.body, {
    lang: lang
  }) || {};

  User.create(data)
    .then(user => {
      user.password = undefined;
      user.recoveryCode = undefined;
      res.json(user);
    })
    .catch(err => {
      log.error(err);
      res.status(500).send({
        msg: 'user_post_500'
      });
    });
};

exports.delete = (req, res) => {
  User.findByIdAndUpdate({
      _id: req.params.user
    }, {
      active: false
    }, {
      new: true
    })
    .then(user => {
      if (!user) {
        return res.sendStatus(404);
      }

      res.sendStatus(204);
    })
    .catch(err => {
      log.error(err);
      res.status(422).send(err.errors);
    });
};