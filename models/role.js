const mongoose = require('mongoose');
const mongooseStringQuery = require('mongoose-string-query');

const RoleSchema = mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
    trim: true,
    index: true,
    unique: true,
    required: true
  },
  createdAt: {
    type: Date,
    select: false
  },
  updatedAt: {
    type: Date,
    select: false
  }
}, {
  collection: 'roles',
  timestamps: true
});

RoleSchema.plugin(mongooseStringQuery);
module.exports = mongoose.model('Role', RoleSchema);