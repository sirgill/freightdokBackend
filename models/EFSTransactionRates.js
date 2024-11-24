const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EFSTransactionRate = new Schema({
    orgId: {
        type: Schema.Types.ObjectId,
        ref: 'organizations',
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    minAmount: {
        type: Number, // Minimum value of the range, e.g., 1
        required: true
    },
    maxAmount: {
        type: Number, // Maximum value of the range, e.g., 100
        required: true
    },
    transactionCost: {
        type: Number, // Transaction cost for this range, e.g., 5.00
        required: true
    },

},
    {
        collection: 'efsTransactionRates'
    },
    {
        timestamps: true
    });

module.exports = mongoose.model('EFSTransactionRates', EFSTransactionRate);
