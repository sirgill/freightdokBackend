const mongoose = require('mongoose');


const canAccess = {
    add: Boolean,
    edit: Boolean,
    delete: Boolean,
    view: Boolean,
}

const rolePermission = new mongoose.Schema({
    userId: {
        type: mongoose.ObjectId,
        ref: 'user'
    },
    roleName: {
        type: String,
        required: true,
        trim: true,
    },
    permissions: {
        users: { ...canAccess },
        loads: { ...canAccess },
        bids: { ...canAccess },
        drivers: { ...canAccess },
        invoices: { ...canAccess },
        facilities: { ...canAccess },
        ownerOperators: { ...canAccess },
        carrierProfile: { ...canAccess },
        openBoard: { ...canAccess },
        history: { ...canAccess },
    },
    isDefault: Boolean,
}, {
    timestamps: true
});

rolePermission.pre('validate', function (next) {
    this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase()
    next();
});

const RolePermission = mongoose.model('rolesPermission', rolePermission);



module.exports = RolePermission;