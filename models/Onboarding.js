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
        type: Boolean
    },
    message: String,
    dot: {
        type: String,
        required: true
    }
},
    {
        collection: 'Onboarding'
    },
    {
        timestamps: true
    });

module.exports = mongoose.model('Onboarding', Onboarding);