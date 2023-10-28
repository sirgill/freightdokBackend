const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Organizations = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
    otherOrgMetaData: {
        type: Object,
        required: true
    },
},
    {
        collection: 'organizations'
    },
    {
        timestamps: true
    });

module.exports = mongoose.model('organizations', Organizations);
