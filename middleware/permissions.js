const ROLE_NAMES = {
    superAdmin: "superAdmin",
    dispatch: "dispatch",
    admin: "admin",
    ownerOperator: "ownerOperator",
    support: 'support',
    driver: 'driver'
};

const authAdmin = (req, res, next) => {
    if (req.user.role === ROLE_NAMES.admin || req.user.role === ROLE_NAMES.superAdmin) {
        next();
    }
    else res.status(403).json({ success: false, message: "User Forbidden" });
};

const authSuperAdmin = (req, res, next) => {
    if (req.user.role !== ROLE_NAMES.superAdmin) {
        return res.status(403).json({ success: false, message: "User Forbidden" });
    }
    next();
};

const authorizedInvoiceUserWithElevatedPriv = async (req, res, next) => {
    try {
        const { id } = req.user;
        const doesRoleHasViewPermission = await RolePermission.findOne({ 'permissions.invoices.view': true, userId: id });

        if (!doesRoleHasViewPermission) {
            return res.status(403).json({ message: "User Forbidden", success: false });
        }
        const { permissions: { invoices: { hasElevatedPrivileges = false } = {} } = {} } = doesRoleHasViewPermission || {};
        if (!hasElevatedPrivileges) {
            return res.status(403).json({ message: "User Forbidden", success: false });
        }
        next();
    } catch (error) {
        return res.status(400).json({ message: "Error validating user", success: false });
    }
}

module.exports = {
    authAdmin,
    ROLE_NAMES,
    authSuperAdmin,
    authorizedInvoiceUserWithElevatedPriv
};
