const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const mongooseStringQuery = require('mongoose-string-query');
const argon2 = require('argon2');

const log = require('../utils/logger');
const email = require('../utils/email').email;
MailOptions = require('../utils/email').MailOptions;

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    trim: true,
    index: true,
    unique: true,
    required: true
  },
  username: {
    type: String,
    lowercase: true,
    trim: true,
    index: true,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    trim: true,
    required: true
  },
  lang: {
    type: String,
    enum: ['en', 'fr'],
    trim: true,
    required: true,
    default: 'en'
  },
  recoveryCode: {
    type: String,
    trim: true,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  },
  admin: {
    type: Boolean,
    default: false
  }
}, {
  collection: 'users'
});

UserSchema.pre('find', function () {
  this.where({
    active: true
  });
});
UserSchema.pre('findOne', function () {
  this.where({
    active: true
  });
});

UserSchema.pre('save', function (next) {
  this.wasNew = this.isNew;

  if (!this.isModified('password')) {
    return next();
  }

  encrypt(this.password, {}).then(
    hash => {
      this.password = hash;
      return next();
    }
  )
})

UserSchema.post('save', function (doc, next) {
  if (!this.wasNew) {
    next();
  }

  let mailOptions = new MailOptions({
    user: doc,
    type: 'welcome',
    data: {}
  });
  email(mailOptions);
  next();
});

UserSchema.pre('findOneAndUpdate', function (next) {
  this.where({
    active: true
  });
  if (!this._update.password) {
    return next();
  }

  encrypt(this._update.password, {}).then(
    hash => {
      this._update.password = hash;
      return next();
    }
  )

  /*email({
  	type: 'password',
  	email: this._conditions.email,
  	passcode: this._update.recoveryCode
  })
  	.then(() => {
  		next();
  	})
  	.catch(err => {
  		logger.error(err);
  		next();
  	});*/
});

function encrypt(value, options) {
  return new Promise((resolve, reject) => {
    argon2.hash(value, options).then(hash => {
      resolve(hash);
    }).catch(err => {
      resolve(null);
    });
  });
}

UserSchema.plugin(timestamps);
// transform password field in hash
//UserSchema.plugin(require('./plugins/argon2_plugin'), {argon2: {}, fields: ['password']});
UserSchema.plugin(mongooseStringQuery);

UserSchema.index({
  email: 1,
  username: 1
});

module.exports = mongoose.model('User', UserSchema);