const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
    load: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "load",
    },
    from: {
        type: Object,
        default: {
            name: '',
            email: '',
            company_name: ''
        }
    },
    to: {
        type: Object,
        default: {
            name: '',
            email: '',
            company_name: ''
        }
    },
},{
  timestamps: true
});

module.exports = Invoice = mongoose.model('invoice', InvoiceSchema);
