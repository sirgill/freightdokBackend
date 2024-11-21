const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OwnerOperatorServiceCost = new Schema({
    orgId: {
        type: Schema.Types.ObjectId,
        ref: 'organizations',
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    lease: {
        type: Number,
        required: true
    },
    truckInsurance: {
        type: Number,
        required: true
    },
    trailerInsurance: {
        type: Number,
        required: true
    },
    eld: {
        type: Number,
        required: true
    },
    parking: {
        type: Number,
        required: true
    },
    costs: {
        type: Object,
        required: true
    },
    total: {
        type: Number,
        required: true
    }
},
    {
        collection: 'ownerOperatorServiceCost'
    },
    {
        timestamps: true
    });

module.exports = mongoose.model('ownerOperatorServiceCost', OwnerOperatorServiceCost);
