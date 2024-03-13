const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const RolePermission = require('../../models/RolePermission');
const { sendJson } = require("../../utils/utils");
const mongoose = require("mongoose");
const { DASHBOARDS, DEFAULT_PERMISSIONS } = require("../../utils/dashboardUtils");

/**
 * Save or update the role
 */
router.post('/', auth, async (req, res) => {
    try {
        const { roleName, userId, permissions } = req.body;
        const isValidMongoId = mongoose.Types.ObjectId.isValid(userId);

        if (!isValidMongoId) {
            return res.status(400).json({ message: 'Invalid User ID' });
        }

        const isExistsUserId = await RolePermission.findOne({ userId })
        if (isExistsUserId) {

        } else {
            DASHBOARDS.forEach(dashboard => {
                const { id } = dashboard;
                if (!permissions[id]) {
                    permissions[id] = DEFAULT_PERMISSIONS;
                }
            })
            const body = new RolePermission({ roleName, userId, permissions });
            await body.save();
            res.status(201).json({ success: true, message: 'Role Permission created for user' });
        }
    } catch (error) {
        res.status(500).json(sendJson(false, 'Server failed to do the action', { _dbError: error.message }));
    }
})

module.exports = router;