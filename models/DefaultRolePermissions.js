
const mongoose = require('mongoose');

const defaults = {
    type: Boolean,
    default: false
}
const canAccess = {
    add: Boolean,
    edit: Boolean,
    delete: Boolean,
    view: Boolean,
    hasElevatedPrivileges: defaults,
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
        serviceCosts: {
            view: defaults,
            addOpCosts: defaults,
            viewOpCosts: defaults,
            editOpCosts: defaults,
            deleteOpCosts: defaults,
            addEfsTransactionRates: defaults,
            viewEfsTransactionRates: defaults,
            editEfsTransactionRates: defaults,
            deleteEfsTranasactionRates: defaults
        }
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('DefaultRolePermissions', defaultRolePermission)