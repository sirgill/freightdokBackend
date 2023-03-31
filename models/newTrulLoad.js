const mongoose = require('mongoose');

const NewTrulLoad = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    loadDetail: {
        type: Object,
        required: false
    },
    isBooked: {
        type: Boolean,
        default: false
    },
    wbIsBooked: {
        type: Boolean,
        default: false
    },
    offerAccepted: {
        type: Boolean,
        default: false
    },
    loadNumber: {
        type: Number,
        required: true,
        unique: true
    },
    isDelivered: {
        type: Boolean,
        default: false
    },
    event_data: {
        type: Object
    },
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('NewTrulLoad', NewTrulLoad);