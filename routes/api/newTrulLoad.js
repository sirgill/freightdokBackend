const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const Load = require("../../models/Load");
const NewTrulLoad = require('../../models/newTrulLoad');

function formatLoad(load, userId) {
    const [pickup] = load.stops || [],
        { geo, zipcode, early_datetime, facility_name } = pickup || {},
        { city = '', state = '' } = geo || {};
    const [_, drop] = load.stops || [],
        { geo: dgeo, zipcode: dZipCode, early_datetime: drop_datetime, facility_name: drop_facilityname } = drop || {},
        { city: dropCity = '', state: dropState = '' } = dgeo || {};
    return {
        loadNumber: load.loadId,
        rate: load.book_now_price,
        user: userId,
        brokerage: 'New Trul',
        pickup: {
            "notes": "",
            "shipperName": facility_name || '',
            "pickupAddress": ``,
            "pickupCity": city,
            "pickupState": state,
            "pickupZip": zipcode,
            "pickupDate": new Date(early_datetime),
            "pickupPo": "",
            "pickupDeliverNumber": "",
            "pickupReference": "",
        },
        drop: {
            "notes": "",
            "receiverName": drop_facilityname || '',
            "dropAddress": ``,
            "dropCity": dropCity,
            "dropState": dropState,
            "dropZip": dZipCode,
            "dropDate": new Date(drop_datetime),
            "dropPo": "",
            "dropDeliverNumber": "",
            "dropReference": "",
        },
        bucketFiles: [],
        status: 'loadCheckedIn',
        equipment: load.equipment,
        modes: load.modes
    }
}

router.post('/', auth, (req, res) => {
    const { body = {}, user } = req,
        { loadId: loadNumber = '', isBooked, offerAccepted = false, loadDetail, _id } = body;
    const newtrulload = new NewTrulLoad({ loadNumber, offerAccepted, isBooked, body: loadDetail });
    const loadToSave = formatLoad(body, user.id);
    const load = new Load(loadToSave)

    newtrulload.save()
        .then(() => {
            load.save(loadToSave)
                .then(response => {
                    NewTrulLoad.updateOne({ loadNumber }, { isBooked })
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
            // res.status(201).json({ success: true, message: 'Load Number: ' + loadNumber + ' saved successfully' })
        })
        .catch(err => {
            res.status(400).json({ success: false, message: err.message || 'Something went wrong' });
        })

})

router.get('/', auth, (req, res) => {
    NewTrulLoad.find()
        .then(loads => {
            res.status(200).send({ totalCount: loads.length, loads })
        })
        .catch(err => {
            console.log(err)
            res.sendStatus(404).json({ totalCount: 0, loads: [] })
        })
})

module.exports = router;