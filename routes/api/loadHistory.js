const express = require("express");
const auth = require("../../middleware/auth");
const Load = require("../../models/Load");
const { getRolePermissionsByRoleName } = require("../../utils/dashboardUtils");
const RolePermission = require("../../models/RolePermission");
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 100, search = '', sortField = 'updatedAt', sortOrder } = req.query,
            { id, role } = req.user;
        const doesRoleHasViewPermission = await RolePermission.findOne({ 'permissions.history.view': true, userId: id });

        if (!doesRoleHasViewPermission) {
            return res.status(403).json({ message: "Unauthorized", success: false });
        }

        const { permissions: { history: { hasElevatedPrivileges = false } = {} } = {} } = doesRoleHasViewPermission || {};
        const [adminRoleData] = await getRolePermissionsByRoleName('admin') || [];
        const to_search = search.toLowerCase();
        const regex = { $regex: to_search, $options: 'i' };
        const query = {
            status: { $in: ['archived'] },
            $or: [
                { loadNumber: regex },
                { "pickup.pickupCity": regex },
                { "pickup.pickupState": regex },
                { "drop.dropCity": regex },
                { "drop.dropState": regex },
            ]
        }

        // Only admins will be seeing all the load history
        if (role.toLowerCase() === adminRoleData?.roleName.toLowerCase() || hasElevatedPrivileges) {
            query.orgId = req.user.orgId;
        } else {
            query.user = id;
        }
        const totalCountPromise = Load.countDocuments(query);

        // Find the requested page of loads with pagination
        const loads = await Load.find(query)
            .limit(+limit)
            .skip((page - 1) * limit)
            .populate('user', 'firstName lastName name email')
            .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
            .exec();

        const [totalCount, loadsData] = await Promise.all([totalCountPromise, loads]);

        res.status(200).json({ data: loadsData, totalCount });
    } catch (error) {
        console.error(error.message)
        res.status(400).json({ message: error.message, data: [] });
    }
})

router.get('/:id', auth, async (req, res) => {
    const { id } = req.params;
    try {
        const load = await Load.findById(id).populate('user', 'firstName lastName email name');
        res.status(200).json({ data: load })
    } catch (error) {
        console.log(error.message)
        res.status(404).json({ _dbError: error.message })
    }
})

module.exports = router;