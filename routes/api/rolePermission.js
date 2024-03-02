const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const { Roles, Permissions, Dashboards } = require('../../models/RolePermission');
const mongoose = require("mongoose");

router.get('/rolesAndPermissions', auth, async (req, res) => {
    try {
        const roles = await Roles.find({}).sort({ name: 1 });
        const dashboards = await Dashboards.find({}).sort({ name: 1 });
        res.status(200).json({ roles, dashboards })
    } catch (error) {
        res.status(400).json({ data: {}, message: error.message })
    }
})

router.get('/all', auth, (req, res) => {
    try {
        Permissions.find()
            .populate(['dashboard', 'role'])
            .exec((err, result) => {
                if (err) {

                } else {
                    res.status(200).json({ data: result })
                }
            })
    } catch (error) {

    }
})

//Create a new Role Dashboard Mapping
router.post('/', auth, async (req, res) => {
    const { dashboardId, roleId, permissions } = req.body;
    if (!dashboardId || !roleId) {
        return res.status(400).json({ message: 'Missing required fields in request body' });
    }

    const isValidDashboardId = mongoose.Types.ObjectId.isValid(dashboardId);
    const isValidRoleId = mongoose.Types.ObjectId.isValid(roleId);

    if (!isValidDashboardId || !isValidRoleId) {
        return res.status(400).json({ message: 'Invalid dashboard or role ID' });
    }


    try {
        const dashboard = await Dashboards.findById(dashboardId);
        const role = await Roles.findById(roleId);

        if (!dashboard || !role) {
            return res.status(404).json({ message: 'Dashboard or role not found' });
        }

        const dashboardRole = new Permissions({
            dashboard: dashboardId,
            role: roleId,
            permissions
        });

        await dashboardRole.save();
        res.status(201).json({ message: 'Dashboard role mapping created successfully' });

    } catch (error) {
        console.log(error.message)
        res.status(400).json({ message: error.message })
    }
})

module.exports = router;