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

module.exports = {
    authAdmin,
    ROLE_NAMES,
    authSuperAdmin
};
