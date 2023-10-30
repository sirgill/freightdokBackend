const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const FMCSA = require('../../models/FMCSA')
const multer = require("multer");
const path = require("path");
const uploader = require("../../utils/uploader");
const User = require("../../models/User");
const { FetchSecret, createSecretCred } = require("../../secrets");
const { authAdmin } = require("../../middleware/permissions");

router.get('/', auth, async (req, res) => {
    try {
        const { role = '', id: userId } = req.user;
        const allCarrierProfiles = [];
        if (role.toLowerCase() === 'admin') {
            const data = await FMCSA.find({});
            data.forEach(profile => {
                const { autoLiabilityInsurance = {}, generalLiabilityInsurance = {}, cargoLiabilityInsurance = {} } = profile
                allCarrierProfiles.push({ autoLiabilityInsurance, generalLiabilityInsurance, cargoLiabilityInsurance, ...getFMCSACarrierProfileProps(profile.content) });
            })
            res.status(200).json({ success: true, data: allCarrierProfiles })
        } else {
            const data = await FMCSA.findOne({ userId });
            const profileData = getFMCSACarrierProfileProps(data);
            if (!profileData) {
                return res.status(404).json({ success: false, data: [] })
            }
            allCarrierProfiles.push(profileData);
            res.status(200).json({ success: true, data: allCarrierProfiles })
        }
    } catch (err) {
        console.log('error', err.message);
        return res.status(500).send(err.message);
    }
});



const getFMCSACarrierProfileProps = (content) => {
    if (!content) {
        return null;
    }
    const { carrier: { allowedToOperate: operatingStatus = '', ein, legalName: companyName, dotNumber } = {} } = content
    return { operatingStatus, ein, companyName, dotNumber }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const upload_path = path.join(__dirname, '../../documents/load');
        cb(null, upload_path)
    },
    filename: function (req, { originalname }, cb) {
        const file_new_name = Date.now() + originalname;
        cb(null, file_new_name)
    }
});
const upload = multer({ storage: storage });

router.post('/', auth, upload.any(), async (req, res) => {
    try {
        const { email, phone } = req.body;
        const { id: userId } = req.user;
        const files = req.files;
        let { success, data = [] } = await uploader(files);
        if (success) {
            const obj = {}
            data && data.forEach(file => {
                obj[file.fileType] = {
                    fileType: file.fileType,
                    url: file.fileLocation
                };
            })
            FMCSA.findOneAndUpdate({ userId }, obj)
                .then(async model => {
                    if (model) {
                        const onUserUpdate = await User.findOneAndUpdate({ _id: userId }, { email, phone })
                        if (onUserUpdate) {
                            res.status(200).json({ message: 'Successfully updated' })
                        }
                    }
                })
            // User.findOneAndUpdate({ id: userId }, { email, phone })
        }
        else {
            res.status(400).json({ message: 'Unable to Upload files. Please try again later.' })
        }
    } catch (error) {
        console.log(error.message)
    }
})

/*
    KEY         Value
    Ch          api key  
    newtrul     api key
    mc#         

*/

// **************************($78686- Secrets Manager Code)*****************************

router.get("/secret-manager", auth, async (req, res) => {
    const { orgId } = req.query;
    const role = req.user.role.toLowerCase()
    if (role === "admin" || role === "superadmin") {
        const ans = await FetchSecret(orgId)
        if (ans.success) {
            const keys = Object.keys(ans?.data || {});
            const values = Object.values(ans?.data || {});
            const data = (keys || []).map((key, i) => {
                return {
                    integrationName: key,
                    code: values[i] || '',
                    email: values[keys.indexOf('email')] || null,
                    mc: values[keys.indexOf('mc')] || null,
                    token: values[keys.indexOf('token')] || null
                }
            })
            const _data = [data[keys.indexOf('chRobinson')], data[keys.indexOf('newtrul')]]
            res.status(200).json({ success: true, data: _data, _dbData: ans.data });
        } else {
            res.status(200).json({ data: [] });
        }
    }
    else {
        res.status(401).json({ success: false, message: 'User Not Authorized!' })
    }
})


router.post("/secret-manager", auth, authAdmin, async (req, res) => {
    const { update = false } = req.query
    const orgId = req.user.orgId // This userid is used as orgId
    const secretObject = req.body;
    const role = req.user.role.toLowerCase();
    let ans;
    if (role === "admin" || role === "superadmin") {
        ans = await createSecretCred(update === 'true', orgId, secretObject);
        res.status(200).json(ans);
    }
    else {
        res.status(401).json({ success: false, message: 'User Not Authorized!' })
    }
})


router.get("/:id", auth, (req, res) => {
    try {
        const { params: { id = '' } } = req;
        FMCSA.find({ userId: id }).populate('userId', ['email', 'phone'])
            .then(result => {
                if (result) {
                    const { userId: { email, phone } = {}, autoLiabilityInsurance, generalLiabilityInsurance, cargoLiabilityInsurance } = result[0] || {};
                    res.status(200).json({
                        data: {
                            autoLiabilityInsurance, generalLiabilityInsurance, cargoLiabilityInsurance, email, phone
                        },
                        success: true
                    })
                }
            })
    } catch (error) {
        res.sendStatus(500)
        console.log(error.message)
    }

})



module.exports = router;