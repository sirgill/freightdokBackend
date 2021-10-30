const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  company: {
    type: String
  },
  title: {
    type: String
  },
  name: {
    type: String
  },
  image: {
    type: String
  },
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);
