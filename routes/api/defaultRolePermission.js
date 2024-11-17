const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const DefaultRolePermission = require('../../models/DefaultRolePermissions');
const mongoose = require("mongoose");
const DefaultRolePermissions = require("../../models/DefaultRolePermissions");
const RolePermission = require("../../models/RolePermission");
const { getRolePermissionsByRoleName } = require("../../utils/dashboardUtils");

router.get('/rolesAndPermissions', auth, async (req, res) => {
    try {
        const rolePermissions = await DefaultRolePermission.find({})
        res.status(200).json({ permissions: rolePermissions, success: true })
    } catch (error) {
        res.status(400).json({ data: [], message: error.message })
    }
})

router.post('/assignDefaultPermissions', auth, (req, res) => {
    try {
        const { userId, permissionId } = req.body;
        const isValidPermissionId = mongoose.Types.ObjectId.isValid(permissionId);

        if (!isValidPermissionId) {
            return res.status(400).json({ message: 'Invalid permission ID' });
        }

        DefaultRolePermission.findById({ _id: permissionId }, async (err, result) => {
            if (err) {
                return res.status(404).json({ message: 'Role not found. Please check id', _dbError: err.message });
            }
            const { permissions, roleName } = result;
            const isExistUser = await User.findById({ _id: userId });
            if (isExistUser) {
                /** We do not want to create records with same user id */
                const existingRecord = await RolePermission.findOne({ userId });
                if (existingRecord) {
                    await RolePermission.updateOne(
                        { _id: existingRecord._id }, // Identify the document to update
                        { $set: { permissions, roleName, isDefault: true } }
                    );
                    res.status(200).json({ message: "User updated with default permissions of " + roleName });
                }
                else {
                    const rolePermission = new RolePermission({ userId, permissions, roleName, isDefault: true });
                    await rolePermission.save();
                    res.status(201).json({ message: "New User in Role Permissions saved with default permissions of " + roleName });
                }
            } else {
                res.status(403).json({ message: 'User not found', success: false })
            }
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, success: false });
    }
})

router.get('/getRoleAndPermissionById', auth, async (req, res) => {
    try {
        const rolePermission = await DefaultRolePermission.findById({ _id: req.query._id })
        const allRoles = await DefaultRolePermission.find()
        res.status(200).json({ data: rolePermission, allRoles })
    } catch (error) {
        console.log(error.message)
        res.status(400).json({ message: error.message })
    }
})

router.post('/', auth, (req, res) => {
    const { roleName, permissions } = req.body;
    if (!roleName || !permissions) {
        return res.status(400).json({ message: 'Role name or permissions not defined', success: false })
    }
    try {
        const defaultRolePermission = new DefaultRolePermissions({ roleName, permissions });
        defaultRolePermission.save()
            .then(async result => {
                // const rolePermissionUpdate = await RolePermission.updateMany({ $and: [{ roleName }, { isDefault: true }] }, { $set: { permissions } });
                const all = await getRolePermissionsByRoleName(roleName)
                console.log('rolePermissionUpdate', all);
                res.status(201).json({ message: 'Role Created', data: result });
            })
            .catch(err => {
                if (err.message.includes('roleName_1 dup')) {
                    return res.status(403).json({ message: 'Role Name is already present in freightdok', _dbError: err.message });
                }
                res.status(400).json({ message: 'Something went wrong', _dbError: err.message });
            })
    } catch (error) {
        res.status(400).json({ message: 'Role not saved', _dbError: err.message });
    }
})

//Create a new Role Dashboard Mapping
router.put('/', auth, async (req, res) => {
    const { roleId: _id, permissions, dashboard, roleName } = req.body;
    if (!_id) {
        return res.status(400).json({ message: 'Missing required fields in request body' });
    }

    const isValidRoleId = mongoose.Types.ObjectId.isValid(_id);

    if (!isValidRoleId) {
        return res.status(400).json({ message: 'Invalid role ID' });
    }

    const newPermissions = { ...permissions };

    try {
        DefaultRolePermission.updateOne({ _id }, { permissions: newPermissions, roleName }, async (err) => {
            if (err) {
                return res.status(400).json({ message: 'Something went wrong.', _dbError: err.message })
            }
            const allPermissionOfRoleName = await getRolePermissionsByRoleName(roleName)
            if (allPermissionOfRoleName.length) {
                const roleNames = allPermissionOfRoleName.map(permission => new RegExp(`^${permission.roleName}$`, 'i'));
                await RolePermission.updateMany({ roleName: { $in: roleNames }, isDefault: true }, { $set: { permissions: newPermissions } });
            }
            res.status(200).json({ message: 'Dashboard role mapping Updated successfully' });
        })

    } catch (error) {
        console.log(error.message)
        res.status(400).json({ message: error.message })
    }
})

module.exports = router;