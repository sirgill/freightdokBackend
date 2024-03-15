const mongoose = require('mongoose');
const { roles } = require('../config/default.json');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  name: String,
  firstName: String,
  lastName: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  orgId: {
    type: Schema.Types.ObjectId,
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  phone: {
    type: String,
  },
  dot: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    default: 'user',
  },
  rolePermissionId: {
    type: mongoose.ObjectId,
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
UserSchema.statics.checkUserExistsByEmail = async function (email, callback) {
  return new Promise((resolve) => {
    mongoose.models['user'].countDocuments({ email }, function (err, result) {
      if (err) {
        resolve(false)
      }
      resolve(result > 0);
    })
  })
}

module.exports = User = mongoose.model('user', UserSchema);
