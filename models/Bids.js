const mongoose = require('mongoose');

const BidsSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'vendors'
    },
    ownerOpId: {
        type: String,
        required: true
    },
    loadNumber: {
        type: String
    },
    bidAmount: {
        type: String
    },
    contactId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'contact'
    },
    status: {
        type: Boolean,
        default: 0
    }    
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('bids', BidsSchema);
