const mongoose = require('mongoose');

const VendorsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    website: {
        type: String
    },
    url: {
        type: String
    },
    clientId: {
        type: String
    },
    clientSecret: {
        type: String
    },
    env: {
        type: String,
        enum : ['dev','production'],
        default: 'dev'
    },
},
    {
        timestamps: true,
    }
);

module.exports = Vendors = mongoose.model('vendors', VendorsSchema);
