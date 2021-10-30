const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const LoadSchema = require("mongoose").model("load").schema

const DriverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },

  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
  },

  loads: [LoadSchema],

  // mcnumber: {
  //   type: Number
  // },

  // dotnumber: {
  //   type: Number
  // },

},{
  timestamps: true
});

module.exports = Driver = mongoose.model('drivers', DriverSchema);
