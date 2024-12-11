const RolePermission = require('../models/RolePermission'); // Adjust the path

// Middleware to validate orgId
const validateViewAccess = (dashboardId) => async (req, res, next) => {
    if (!dashboardId) {
        throw new Errors('dashboard Id not provided');
    }
    const { id } = req.user;
    const doesRoleHasViewPermission = await RolePermission.findOne({ [`permissions.${dashboardId}.view`]: true, userId: id });

    if (!doesRoleHasViewPermission) {
        return res.status(403).json({ message: "Unauthorized", success: false });
    }
    next();
};

module.exports = validateViewAccess;