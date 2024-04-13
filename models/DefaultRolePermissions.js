
const mongoose = require('mongoose');

const canAccess = {
    add: Boolean,
    edit: Boolean,
    delete: Boolean,
    view: Boolean,
}

const defaultRolePermission = mongoose.Schema({
    roleName: {
        type: String,
        unique: true,
    },
    permissions: {
        users: { ...canAccess },
        loads: { ...canAccess },
        bids: { ...canAccess },
        drivers: { ...canAccess },
        invoices: { ...canAccess },
        facilities: { ...canAccess },
        ownerOperator: { ...canAccess },
        carrierProfile: { ...canAccess },
        openBoard: { ...canAccess },
        history: { ...canAccess },
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('DefaultRolePermissions', defaultRolePermission)