const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orgUsers = new Schema({
    orgId: {
        type: Schema.Types.ObjectId,
        ref: 'organizations',
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
},
    {
        collection: 'orgUsers'
    },
    {
        timestamps: true
    });

module.exports = mongoose.model('orgUsers', orgUsers);
