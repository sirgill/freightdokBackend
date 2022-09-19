const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const LoadSchema = require("mongoose").model("load").schema

const FMCSA = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    content: {
        type: Object,
        required: true
    },
    autoLiabilityInsurance: {
        type: Object
    },
    generalLiabilityInsurance: {
        type: Object
    },
    cargoLiabilityInsurance: {
        type: Object
    },

},
    {
        collection: 'FMCSA'
    },
    {
        timestamps: true
    });

module.exports = mongoose.model('FMCSA', FMCSA);
