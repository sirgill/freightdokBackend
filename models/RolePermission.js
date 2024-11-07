const mongoose = require('mongoose');


const canAccess = {
    add: Boolean,
    edit: Boolean,
    delete: Boolean,
    view: Boolean,
    hasElevatedPrivileges: {
        type: Boolean,
        default: false
    }
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
        invoices: {
            ...canAccess,
            canSendToTriumph: {
                type: Boolean,
                default: false
            }
        },
        facilities: { ...canAccess },
        ownerOperator: { ...canAccess },
        carrierProfile: { ...canAccess },
        openBoard: { ...canAccess },
        history: { ...canAccess },
    },
    isDefault: {
        type: Boolean,
        default: true
    },
}, {
    timestamps: true
});

rolePermission.pre('validate', function (next) {
    this.roleName = this.roleName.charAt(0).toUpperCase() + this.roleName.slice(1).toLowerCase()
    next();
});

const RolePermission = mongoose.model('rolesPermission', rolePermission);



module.exports = RolePermission;