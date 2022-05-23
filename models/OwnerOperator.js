const { roles } = require('../config/default.json');
const mongoose = require('mongoose');

const OwnerOperatorSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
    },
    role: {
        type: String,
        default: 'ownerOperator',
        enum: roles
      },
    phoneNumber: {
       type: String,
    },
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('ownerOperator', OwnerOperatorSchema);
