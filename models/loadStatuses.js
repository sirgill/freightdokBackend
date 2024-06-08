const mongoose = require("mongoose");

const load_statuses = new mongoose.Schema({
    id: String,
    label: {
        type: String,
        unique: true,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('load_statuses', load_statuses);