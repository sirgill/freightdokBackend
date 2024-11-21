const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EFSTransactionRate = new Schema({
    orgId: {
        type: Schema.Types.ObjectId,
        ref: 'organizations',
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    amountRange: {
        type: String,
        required: true, 
    },
    transactionCost: {
        type: Number,
        required: true,
        min: 0
    }
},
    {
        collection: 'efsTransactionRates'
    },
    {
        timestamps: true
    });

module.exports = mongoose.model('EFSTransactionRate', EFSTransactionRate);
