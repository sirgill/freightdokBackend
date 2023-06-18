const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const Onboarding = require('../../models/Onboarding')

router.get('/', auth, (req, res) => {
    try {
        Onboarding.find({ isPendingApproval: true })
            .then(resp => res.status(200).send(resp));
    } catch (error) {
        res.status(400);
    }
})

module.exports = router;