const DefaultRolePermissions = require("../models/DefaultRolePermissions");
const RolePermissions = require("../models/RolePermission");

const DASHBOARDS = [
    { "id": "bids", "label": "Bids" },
    { "id": "carrierProfile", "label": "Carrier Profile" },
    { "id": "drivers", "label": "Drivers" },
    { "id": "history", "label": "History" },
    { "id": "invoices", "label": "Invoices" },
    { "id": "loads", "label": "Loads" },
    { "id": "openBoard", "label": "Open Board" },
    { "id": "ownerOperator", "label": "Owner Operator" },
    { "id": "users", "label": "Users" },
    { "id": "facilities", "label": "Facilities" },
    { id: 'serviceCosts', 'label': 'Service Costs' },
    { id: 'businessIntelligence', label: 'Business Intelligence' }
]

const DEFAULT_PERMISSIONS = { add: false, edit: false, delete: false, view: false, elevatedPrivileges: false };

const getRolePermissionsByRoleName = async (roleName) => {
    try {
        const all = await DefaultRolePermissions.find({ roleName: { $regex: roleName.toLowerCase(), $options: 'i' } });
        return all;
    } catch (error) {
        return null
    }
}

const getRolePermissionsForUser = async (userId) => {
    try {
        const userPermission = await RolePermissions.findOne({ userId });
        return userPermission;
    } catch (error) {
        return null;
    }
}

module.exports = {
    DEFAULT_PERMISSIONS,
    DASHBOARDS,
    getRolePermissionsForUser,
    getRolePermissionsByRoleName
}