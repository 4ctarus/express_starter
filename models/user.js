const mongoose = require('mongoose');
const mongooseStringQuery = require('mongoose-string-query');
const argon2 = require('argon2');
const {
  isEmail
} = require('validator');

const email = require('../utils/email').email;
MailOptions = require('../utils/email').MailOptions;

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    trim: true,
    index: true,
    unique: true,
    required: true,
    validate: isEmail
  },
  username: {
    type: String,
    lowercase: true,
    trim: true,
    index: true,
    unique: true,
    required: true,
    match: /^[0-9a-z]+$/ // is alpha-numeric
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
    lowercase: true,
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
    default: false
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }
}, {
  collection: 'users',
  timestamps: true
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
  
  if (this.password.length < 8) {
    var err = new mongoose.Error.ValidationError(null);
    err.addError('password', new mongoose.Error.ValidatorError({ message: 'invalid', type: 'user defined', path: 'password', value: 'value' })); 
    throw err;
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
    return next();
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

  if (this.password.length < 8) {
    var err = new mongoose.Error.ValidationError(null);
    err.addError('password', new mongoose.Error.ValidatorError({ message: 'invalid', type: 'user defined', path: 'password', value: 'value' })); 
    throw err;
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

//UserSchema.plugin(timestamps);
// transform password field in hash
//UserSchema.plugin(require('./plugins/argon2_plugin'), {argon2: {}, fields: ['password']});
UserSchema.plugin(mongooseStringQuery);

/*UserSchema.index({
  email: 1,
  username: 1
});*/

module.exports = mongoose.model('User', UserSchema);