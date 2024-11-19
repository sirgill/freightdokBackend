const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const factoringPartners = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    host: String,
    port: String,
    noticeText: {
        required: true,
        type: String
    },
    orgId: {
        type: Schema.Types.ObjectId,
        ref: 'organizations',
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    lastUpdatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('factoringPartners', factoringPartners);