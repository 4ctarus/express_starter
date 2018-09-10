const validator = require('validator');
const fs = require('fs');
var jwt = require('jsonwebtoken');
const argon2 = require('argon2');

const User = require('../models/user');
const log = require('../utils/logger');

exports.login = (req, res) => {
  const data = req.body || {};

  if (!data.email || !validator.isEmail(data.email)) {
    return res.status(422).send({
      msg: 'auth_login_email_422'
    });
  }

  if (!data.password || !validator.isLength(data.password, {
      min: 8,
      max: undefined
    })) {
    return res.status(422).send({
      msg: 'auth_login_password_422'
    });
  }

  let query = {
    email: validator.normalizeEmail(data.email)
  };

  User.findOne(query)
    .then(user => {
      if (!user) {
        return res.status(400).json({
          msg: "auth_login_user_400"
        });
      }

      argon2.verify(user.password, data.password).then(match => {
        if (!match) {
          return res.status(400).json({
            msg: "auth_login_password_400"
          });
        }

        // create user token
        let cert = fs.readFileSync('private_key.pem');
        let token = jwt.sign({
          sub: user._id
        }, cert, {
          algorithm: 'RS256',
          expiresIn: '7d'
        });

        user.password = undefined;
        user.recoveryCode = undefined;
        return res.json({
          user: user,
          token: token
        });
      }).catch((err) => {
        log.error(err);
        return res.status(500).json({
          msg: "auth_login_500"
        });
      });

    })
    .catch(err => {
      log.error(err);
      res.status(422).send(err.errors);
    });
};