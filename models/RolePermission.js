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
    hasElevatedPrivileges: defaults
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
        carrierProfile: {
            ...canAccess,
            viewFactoringPartners: {
                type: Boolean,
                default: false
            },
            updateFactoringPartners: {
                type: Boolean,
                default: false
            }
        },
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
        },
        businessIntelligence: {
            overviewTab: defaults,
            historicalTab: defaults,
            financialTab: defaults,
            view: defaults,
            hasElevatedPrivileges: defaults,
            canViewCards: defaults,
        }
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