const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OwnerOperatorServiceCost = new Schema({
    orgId: {
        type: Schema.Types.ObjectId,
        ref: 'organizations',
    },
    ownerOperatorId: {
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
    additionalCosts: {
        type: Object,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
},
    {
        collection: 'ownerOperatorServiceCost'
    },
    {
        timestamps: true
    });

module.exports = mongoose.model('ownerOperatorServiceCost', OwnerOperatorServiceCost);
