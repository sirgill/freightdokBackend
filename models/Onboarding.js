const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Onboarding = new Schema({
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    otp: {
        type: String,
    },
    isPendingApproval: {
        type: Boolean
    }
},
    {
        collection: 'Onboarding'
    },
    {
        timestamps: true
    });

module.exports = mongoose.model('Onboarding', Onboarding);