const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const OwnerOp = require('../../models/OwnerOperator');
const User = require("../../models/User");
const { authAdmin, ROLE_NAMES } = require("../../middleware/permissions");

router.post('/', auth, authAdmin, (req, resp) => {
    try {
        const { body = {} } = req;
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
                resp.status(201).json({ message: 'Updated successfully' });
            })
        } else {
            resp.status(400).json({ success: false, data: 'This user does not exists' });
        }
    } catch (error) {
        console.log('error while post "/"', error.message)
        resp.status(500).json({ success: false, data: {} });
    }
})

router.get('/', auth, (req, res) => {
    const { orgId, role } = req.user
    try {
        if (['superAdmin', 'admin'].includes(role)) {
            User.find({ orgId, role: ROLE_NAMES.ownerOperator }, (err, result) => {
                if (err) {
                    return res.status(400).json({ totalCount: 0, data: [], _dbError: err.message });
                }
                res.status(200).json({ totalCount: result.length, data: result });
            })
        } else {
            res.status(401).json({ success: false, message: 'Not Authorized' });
        }
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
        res.status(200).json({ data: result });
    })
})

router.delete('/:id', auth, authAdmin, async (req, res) => {
    const { params: { id = '' } = {} } = req;
    if (!id) {
        return res.status(404).json({ message: 'ID does not exists' })
    }
    User.findByIdAndDelete(id)
        .then(result => {
            if (result)
                res.status(200).json({ message: 'Deleted successfully!' });
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