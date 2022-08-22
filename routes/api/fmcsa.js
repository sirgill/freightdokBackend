const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const FMCSA = require('../../models/FMCSA')

router.get('/', auth, async (req, res) => {
    try {
        const { role, id: userId } = req.user;
        const allCarrierProfiles = [];
        if (role === 'admin') {
            const data = await FMCSA.find({});
            data.forEach(profile => {
                allCarrierProfiles.push(getFMCSACarrierProfileProps(profile.content));
            })
            res.status(200).json({ success: true, data: allCarrierProfiles })
        } else {
            const data = await FMCSA.findOne({ userId });
            const profileData = getFMCSACarrierProfileProps(data);
            allCarrierProfiles.push(profileData);
            res.status(200).json({ success: true, data: allCarrierProfiles })
        }
    } catch (err) {
        return res.status(500).send(err.message);
    }
});



const getFMCSACarrierProfileProps = (content) => {
    const { carrier: { allowedToOperate: operatingStatus = '', ein, legalName: companyName, dotNumber } } = content
    return { operatingStatus, ein, companyName, dotNumber }
}

module.exports = router;