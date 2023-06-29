const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Onboarding = new Schema({
    email: {
        type: String,
        required: [true, 'User email required'],
        unique: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
    },
    otp: {
        type: String,
    },
    isPendingApproval: {
        type: Boolean,
        default: true,
    },
    status: {
        type: String,
        enum: ['Approved', 'Denied', 'Pending'],
        default: 'Pending'
    },
    userRegistrationStatus: {
        type: String,
        enum: ['Pending', 'Complete'],
        default: 'Pending'
    },
    message: String,
    dot: {
        type: String,
        required: true
    },
    origin: {
        type: String
    }
},
    {
        collection: 'Onboarding'
    },
    {
        timestamps: true
    });

module.exports = mongoose.model('Onboarding', Onboarding);