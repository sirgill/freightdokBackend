const RolePermission = require("../models/RolePermission");

const DASHBOARDS = [
    { "id": "bids", "label": "Bids" },
    { "id": "carrierProfile", "label": "Carrier Profile" },
    { "id": "drivers", "label": "Drivers" },
    { "id": "history", "label": "History" },
    { "id": "invoices", "label": "Invoices" },
    { "id": "loads", "label": "Loads" },
    { "id": "openBoard", "label": "Open Board" },
    { "id": "ownerOperator", "label": "Owner Operator" },
    { "id": "users", "label": "Users" }
]

const DEFAULT_PERMISSIONS = { add: false, edit: false, delete: false, view: false };

const getRolePermissionsByRoleName = async (roleName) => {
    try {
        const all = await RolePermission.find({ roleName });
        return all;
    } catch (error) {
        return null
    }
}

module.exports = {
    DEFAULT_PERMISSIONS,
    DASHBOARDS,
    getRolePermissionsByRoleName
}