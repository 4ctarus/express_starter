const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');
const mongooseStringQuery = require('mongoose-string-query');

const email = require('../utils/email').email;
MailOptions = require('../utils/email').MailOptions;

const UserSchema = mongoose.Schema({
  uid: {
    type: String,
    trim: true,
    index: true,
    unique: true,
    required: true
  },
  lang: {
    type: String,
    enum: ['en', 'fr'],
    trim: true,
    required: true,
    default: 'en'
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

  /*let mailOptions = new MailOptions({
    user: doc,
    type: 'welcome',
    data: {}
  });
  email(mailOptions);*/
  next();
});


UserSchema.plugin(timestamps);
UserSchema.plugin(mongooseStringQuery);

UserSchema.index({
  email: 1,
  username: 1
});

module.exports = mongoose.model('User', UserSchema);