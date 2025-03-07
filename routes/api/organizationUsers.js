const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const OrganizationUsers = require('../../models/OrganizationUsers');


router.get('/', auth, (req, resp) => {
    OrganizationUsers.find({}).then((response) => {
        resp.status(200).send({ success: true, data: response });
    }).catch(err => {
        resp.status(400).send({ success: false, message: err.message })
    })
})

router.post("/", auth, (req, res) => {
    OrganizationUsers.create({ ...req.body }).then((response) => {
        if (response._id) {
            res.status(200).send({ success: true, message: "organization created successfully! ", data: response })
        }
    }).catch(err => {
        res.status(400).send({ success: false, message: err.message })
    })
})


module.exports = router