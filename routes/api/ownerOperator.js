const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const User = require("../../models/User");
const { authAdmin, ROLE_NAMES } = require("../../middleware/permissions");
const { getRolePermissionsByRoleName } = require("../../utils/dashboardUtils");
const { createDefaultServiceCost } = require("../../controllers/ownerOperatorServiceCosts/createDefaultServiceCosts");
const { sendJson } = require("../../utils/utils");
const OwnerOperatorServiceCost = require("../../models/OwnerOperatorServiceCost");

router.post('/', auth, authAdmin, async (req, resp) => {
    try {
        const { body = {} } = req;
        const { orgId, id } = req.user;
        const { _id = null } = body;
        console.log('Updating Owner Operator', _id, body.firstName);
        const { firstName, phone } = body;
        /**
         * Server side validations
         */
        if (!firstName) {
            return resp.status(422).json({ success: false, message: 'First Name is mandatory' })
        } else if (!phone) {
            return resp.status(422).json({ success: false, message: 'Phone Number is mandatory' })
        }
        const [rolePermission] = await getRolePermissionsByRoleName('owner operator');
        const { _id: rolePermissionId, roleName } = rolePermission;
        /**
         * Update if _id exists in client request
         */
        if (_id) {
            //Update user
            delete body._id;
            User.findByIdAndUpdate(_id, body, (err, result) => {
                if (err) {
                    return resp.status(500).json({ message: 'Server Error while saving', _dbError: err.message });
                }
                resp.status(200).json({ message: 'Updated successfully' });
            })
        } else {
            // Create new Owner Operator
            delete body._id;
            const user = new User({ ...body, orgId, created_by: id, last_updated_by: id, rolePermissionId, role: roleName })
            user.save()
                .then((data) => {
                    if (data) {
                        createDefaultServiceCost({ ownerOperatorId: data._id, orgId, reqUserId: id }, (err, data) => {
                            if (err) {
                                return resp.status(500).json(sendJson(false, 'Error Creating Service costs for the Owner Operator.'))
                            }
                            return resp.status(201).json({ success: true, message: 'Owner Operator added' });
                        });
                    }
                })
                .catch(err => {
                    console.log(err.message)
                    if (err.name === 'MongoError' && err.code === 11000) {
                        resp.status(403).json({ success: false, message: 'Email already exists' })
                    } else
                        resp.status(400).json({ success: false, message: 'Something went wrong. Please try again later!', _dbError: err.message })
                })
        }
    } catch (error) {
        console.log('error while post "/"', error.message)
        resp.status(500).json({ success: false, data: {}, message: error.message });
    }
})

router.get('/', auth, (req, res) => {
    const { orgId } = req.user;
    const { page = 1, limit = 10 } = req.query,
        query = { orgId, role: { $in: [ROLE_NAMES.ownerOperator, 'Owner Operator'] } };
    try {
        User.find(query)
            .populate('created_by', 'firstName lastName name')
            .limit(+limit)
            .skip((+page - 1) * limit)
            .then(async (result) => {
                const totalCount = await User.countDocuments(query);
                return res.status(200).json({ totalCount, data: result });
            })
            .catch(err => {
                return res.status(400).json({ totalCount: 0, data: [], _dbError: err.message });
            })

    } catch (error) {
        console.log(error.message)
    }
})

router.get('/:id', auth, authAdmin, (req, res) => {
    const { params: { id } } = req;
    User.findById(id, (err, result) => {
        if (err) {
            return res.status(400).json({ success: false, message: 'This user does not exists', _dbError: err.message });
        }
        const _result = {
            firstName: result.firstName,
            lastName: result.lastName,
            email: result.email,
            phone: result.phone,
        }
        res.status(200).json({ data: _result });
    })
})

router.delete('/:id', auth, authAdmin, async (req, res) => {
    const { params: { id = '' } = {} } = req;
    if (!id) {
        return res.status(404).json({ message: 'ID does not exists' })
    }
    User.findOneAndDelete({ _id: id })
        .then(async result => {
            if (result) {
                await OwnerOperatorServiceCost.findOneAndDelete({ ownerOperatorId: id });
                res.status(200).json({ message: 'Deleted successfully!' });
            }
            else {
                res.status(400).json({ message: 'Delete unsuccessful. Please try later.' })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ _dbError: err.message })
        })
})

module.exports = router;