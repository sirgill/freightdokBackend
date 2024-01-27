const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const forgotPasswordOtpSchema = new mongoose.Schema({
    otp: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        ref: 'user',
    },
    expired: {
        type: Boolean,
        required: true,
        default: false
    }
},
    {
        collection: 'forgotPasswordOtp',
        timestamps: true
    },
)

module.exports = mongoose.model('forgotPasswordOtp', forgotPasswordOtpSchema);