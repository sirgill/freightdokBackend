const Organizations = require('../models/Organizations'); // Adjust the path

// Middleware to validate orgId
const validateOrgId = async (req, res, next) => {
    const { orgId } = req.user;

    // Check if orgId is provided and valid
    if (orgId) {
        try {
            const organizationExists = await Organizations.findById(orgId);
            if (!organizationExists) {
                return res.status(400).json({ message: 'Organization does not exist' });
            }
        } catch (error) {
            return res.status(400).json({ message: 'Invalid orgId format', _dbMessage: error.message });
        }
    }

    next();
};

module.exports = validateOrgId;