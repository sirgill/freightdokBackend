const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const Organizations = require('../../models/Organizations');


router.get('/', (req, resp) => {
    Organizations.find({})
        .populate('adminId')
        .exec((err, organizations) => {
            if (err) {
                // Handle error
                console.error(err);
                return resp.status(400).send({ success: false, message: err.message });
            }

            // Iterate through each organization and add a new key with populated adminId data
            const orgsWithAdminData = organizations.map(org => {
                return {
                    ...org.toObject(),
                    adminData: org.adminId,// Adding a new key 'adminData' with populated user data
                    adminId: org.adminId._id,
                };
            });
            // Now orgsWithAdminData contains each organization document with an added 'adminData' key
            return resp.status(200).send({ success: true, data: orgsWithAdminData });
        });
})

router.post("/", auth, (req, res) => {
    Organizations.create({ ...req.body }).then((response) => {
        if (response._id) {
            res.status(200).send({ success: true, message: "organization created successfully! ", data: response })
        }
    }).catch(err => {
        res.status(400).send({ success: false, message: err.message })
    })

})


module.exports = router