const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const Load = require("../../models/Load");
const CHRobinson = require('../../models/chRobinson');

function formatLoad(load, userId) {
    const { destination: { county, countryCode, warehouseCode } = {}, origin: { county: ocounty, countryCode: ocountryCode, warehouseCode: owarehouseCode } } = load;
    return {
        loadNumber: load.loadNumber,
        rate: load.availableLoadCosts[0].sourceCostPerUnit,
        user: userId,
        brokerage: 'C.H Robinson',
        pickup: {
            "notes": "",
            "shipperName": load.origin.name,
            "pickupAddress": `${owarehouseCode}, ${ocounty}, ${ocountryCode}`,
            "pickupCity": load.origin.city,
            "pickupState": load.origin.stateCode,
            "pickupZip": load.origin.postalCode,
            "pickupDate": new Date(load.pickUpByDate),
            "pickupPo": "",
            "pickupDeliverNumber": "",
            "pickupReference": "",
        },
        drop: {
            "notes": "",
            "receiverName": load.destination.name,
            "dropAddress": `${warehouseCode}, ${county}, ${countryCode}`,
            "dropCity": load.destination.city,
            "dropState": load.destination.stateCode,
            "dropZip": load.destination.postalCode,
            "dropDate": new Date(load.deliverBy),
            "dropPo": "",
            "dropDeliverNumber": "",
            "dropReference": "",
        },
        bucketFiles: [],
        status: 'loadCheckedIn'
    }
}

router.post('/', auth, (req, res) => {
    const { body = {}, user } = req,
        { loadNumber = '', isBooked, loadDetail, _id } = body;
    const ch = new CHRobinson({ loadNumber, isBooked, loadDetail });
    const loadToSave = formatLoad(loadDetail, user.id);
    const load = new Load(loadToSave)
    if (!isBooked) {
        ch.save()
            .then(() => {
                res.status(201).json({ success: true, message: 'Load Number: ' + loadNumber + ' saved successfully' })
            })
            .catch(err => {
                res.status(400).json({ success: false, message: err.message || 'Something went wrong' });
            })
    }
    else {
        load.save(loadToSave)
            .then(response => {
                CHRobinson.updateOne({ loadNumber }, { isBooked })
                    .then((response) => {
                        res.status(201).json({ success: true, message: 'Load Number: ' + loadNumber + ' updated successfully' })
                    })
                    .catch(err => {
                        res.status(400).json({ success: false, message: err.message || 'Something went wrong' });
                    })
            })
            .catch(err => {
                res.status(400).json({ success: false, message: err.message || 'Something went wrong' });
            })
    }

})

router.get('/', auth, (req, res) => {
    CHRobinson.find()
        .then(loads => {
            res.status(200).send({ totalCount: loads.length, loads })
        })
        .catch(err => {
            console.log(err)
            res.sendStatus(404).json({ totalCount: 0, loads: [] })
        })
})

module.exports = router;