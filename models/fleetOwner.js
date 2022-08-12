const { roles } = require('../config/default.json');
const mongoose = require('mongoose');

const fleetOwnerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
    },
    role: {
        type: String,
        default: 'fleetOwner',
        enum: roles
    },
    phoneNumber: {
        type: String,
    },
    DOT: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
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

module.exports = mongoose.model('fleetOwner', fleetOwnerSchema);
