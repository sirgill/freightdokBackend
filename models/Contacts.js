const mongoose = require('mongoose');

const ContactsSchema = new mongoose.Schema({
    phoneNumber: {
        type: String
    } ,
    companyName: {
        type: String
    },
    email: {
        type: String
    },
    empCode: {
        type: Number
    }
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('contacts', ContactsSchema);
