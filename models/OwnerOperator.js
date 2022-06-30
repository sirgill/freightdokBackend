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
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('ownerOperator', OwnerOperatorSchema);
