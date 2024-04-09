const mongoose = require('mongoose');
const RolePermission = require('./RolePermission');
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
    ref: 'defaultRolePermission'
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

UserSchema.post('findOneAndDelete', async function (doc, next) {
  if (!doc) {
    return next();
  }

  const userId = doc._id;

  try {
    await RolePermission.deleteMany({ userId });
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.post('remove', async function (doc, next) {
  if (!doc) {
    return next(); // No user deleted, nothing to do
  }

  const userId = doc._id;

  try {
    await RolePermission.deleteMany({ userId });
    next();
  } catch (error) {
    next(error);
  }
})

module.exports = User = mongoose.model('user', UserSchema);
