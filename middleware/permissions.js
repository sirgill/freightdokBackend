const ROLE_NAMES = {
    superAdmin: "superAdmin",
    dispatch: "dispatch",
    admin: "admin",
    ownerOperator: "ownerOperator",
};

const authAdmin = (req, res, next) => {
    if (req.user.role === ROLE_NAMES.admin || req.user.role === ROLE_NAMES.superAdmin) {
        next();
    }
    else res.status(403).json({ success: false, message: "User Not Authorized" });
};

const authSuperAdmin = (req, res, next) => {
    if (req.user.role !== ROLE_NAMES.superAdmin) {
        return res.status(403).json({ success: false, message: "User Not Authorized" });
    }
    next();
};

module.exports = {
    authAdmin,
    authSuperAdmin
};
