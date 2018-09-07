const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const mongooseStringQuery = require('mongoose-string-query');

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

UserSchema.pre('save', function (next) {
  this.wasNew = this.isNew;
  next();
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
  if (!this._update.recoveryCode) {
    return next();
  }

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

UserSchema.plugin(timestamps);
// transform password field in hash
UserSchema.plugin(require('./plugins/argon2_plugin'), {argon2: {}, fields: ['password']});
UserSchema.plugin(mongooseStringQuery);

UserSchema.index({
  email: 1,
  username: 1
});

module.exports = mongoose.model('User', UserSchema);