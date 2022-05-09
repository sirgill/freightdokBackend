const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const Vendors = require('../../models/Vendors');

router.post('/', auth, (req, resp) => {

    try {
        const vendors = new Vendors(req.body);
        vendors.save()
            .then(res => {
                resp.status(200).json({ success: true, data: res });
            })
            .catch(err => {
                resp.status(400).json({ success: false, data: {}, message: err?.message || '' });
            })
    } catch (error) {
        resp.status(500).json({ success: false, data: {} });
    }
})

module.exports = router;