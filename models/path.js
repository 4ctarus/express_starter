const mongoose = require('mongoose');
const mongooseStringQuery = require('mongoose-string-query');

const PathSchema = mongoose.Schema({
  path: {
    type: String,
    lowercase: true,
    trim: true,
    index: true,
    required: true
  },
  method: {
    type: String,
    enum: ['get', 'post', 'put', 'delete'],
    lowercase: true,
    trim: true,
    index: true,
    required: true
  },
  role: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Role'
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
  collection: 'paths',
  timestamps: true
});

PathSchema.plugin(mongooseStringQuery);
module.exports = mongoose.model('Path', PathSchema);