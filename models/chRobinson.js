const mongoose = require('mongoose');

const CHRobinson = new mongoose.Schema({
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
    loadNumber: {
        type: Number,
        required: true,
        unique: true
    },
    isDelivered: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('CHRobinson', CHRobinson);