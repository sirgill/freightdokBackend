const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const CHRobinson = require('../../models/chRobinson');

router.post('/', auth, (req, res) => {
    const { body = {} } = req,
        { loadNumber = '', isBooked, loadDetail, _id } = body;
    const ch = new CHRobinson({ loadNumber, isBooked, loadDetail });
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
        CHRobinson.updateOne({ loadNumber }, { isBooked })
            .then((response) => {
                console.log('HHHHHHH', response)
                res.status(201).json({ success: true, message: 'Load Number: ' + loadNumber + ' updated successfully' })
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