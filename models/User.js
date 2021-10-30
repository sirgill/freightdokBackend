const mongoose = require('mongoose');
const { roles } = require('../config/default.json');

const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    default: 'user',
    enum: roles
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  last_updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  }
});

module.exports = User = mongoose.model('user', UserSchema);
