const mongoose = require('mongoose');

const User = require('../models/user');
const log = require('../utils/logger');

exports.list = (req, res) => {
  const query = req.query || {};

  User.apiQuery(query)
    .select('name email username')
    .populate('role', 'name')
    .then(users => {
      res.json(users);
    })
    .catch(err => {
      log.error(err);
      res.status(422).send(err.errors);
    });
};

exports.get = (req, res) => {
  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    return res.status(400).json({
      msg: 'user_get_400'
    });
  }

  User.findById(req.params.userId, '-password -recoveryCode -updatedAt')
    .populate('role', 'name')
    .then(user => {
      if (!user) {
        return res.status(404).json({
          msg: 'user_get_404'
        });
      }
      res.json(user);
    })
    .catch(err => {
      log.error(err);
      res.status(422).send(err.errors);
    });
};

exports.put = (req, res, next) => {
  const data = req.body || {};
  delete data.email;
  delete data.password;
  delete data.role;

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    return res.status(400).json({
      msg: 'user_put_400'
    });
  }

  User.findByIdAndUpdate({
        _id: req.params.userId
      },
      data, {
        new: true,
        runValidators: true,
        select: '-password -recoveryCode -updatedAt'
      })
    .populate('role', 'name')
    .then(user => {
      if (!user) {
        return res.status(404).json({
          msg: 'user_put_404'
        });
      }
      res.json(user);
    })
    .catch(err => {
      next(err);
    });
};

exports.post = (req, res, next) => {
  let data = req.body || {};
  delete data.role;
  let lang = 'en';
  if (req.headers["accept-language"] && req.headers["accept-language"].includes('fr')) {
    lang = 'fr';
  }

  User.create(
      Object.assign(data, {
        lang: lang
      })
    )
    .then(user => {
      user.password = undefined;
      user.recoveryCode = undefined;
      res.json(user);
    })
    .catch(err => {
      next(err);
    });
};

exports.delete = (req, res) => {
  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    return res.status(400).json({
      msg: 'user_delete_400'
    });
  }

  User.findByIdAndUpdate({
      _id: req.params.userId
    }, {
      active: false
    }, {
      new: true
    })
    .then(user => {
      if (!user) {
        return res.status(404).json({
          msg: 'user_delete_404'
        });
      }

      res.status(204).json({});
    })
    .catch(err => {
      log.error(err);
      res.status(422).send(err.errors);
    });
};

exports.setRole = (req, res) => {
  // check if id is valid
  if (req.body.role && !mongoose.Types.ObjectId.isValid(req.params.userId)) {
    return res.status(400).json({
      msg: 'user_setrole_400'
    });
  }

  User.findByIdAndUpdate({
      _id: req.params.userId
    }, {
      role: req.body.role
    }, {
      new: true,
      runValidators: true,
      select: '-password -recoveryCode -updatedAt'
    })
    .populate('role', 'name')
    .then(user => {
      if (!user) {
        return res.status(404).json({
          msg: 'user_setrole_400'
        });
      }
      res.json(user);
    })
    .catch(err => {
      next(err);
    });
};