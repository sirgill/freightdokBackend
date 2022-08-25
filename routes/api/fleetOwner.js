const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const FleetOwner = require('../../models/fleetOwner');

router.post('/', auth, (req, resp) => {
    try {
        const { body = {} } = req;
        const { _id = null } = body;
        const fleetOwner = new FleetOwner(req.body);
        if (_id) {
            delete body._id;
            fleetOwner.updateOne({ _id }, { ...body })
                .then(response => {
                    if (response.ok) {
                        console.log(_id + ' Fleet Owner Updated');
                        return resp.status(200).json({ message: 'Updated Sucessfully', success: true })
                    }
                })
                .catch(err => console.log(err.message));
        } else fleetOwner.save()
            .then(res => {
                resp.status(200).json({ success: true, data: res, message: 'Fleet Owner created Successfully' });
            })
            .catch(err => {
                resp.status(400).json({ success: false, data: {}, message: err?.message || '' });
            })
    } catch (error) {
        console.log('error while post "/"', error.message)
        resp.status(500).json({ success: false, data: {} });
    }
})

router.get('/', auth, (req, res) => {
    try {
        FleetOwner.find()
            .then(data => {
                res.status(200).json({ success: true, data })
            })
            .catch((err) => {
                console.log(err.message);
                res.status(400).json({ totalCount: 0, data: {}, error: err.message });
            });
    } catch (error) {
        console.log(error.message)
    }
})

router.get('/:id', auth, (req, res) => {
    const { params: { id } } = req;
    FleetOwner.findById(id)
        .then(result => {
            if (result) {
                res.status(200).json({ data: result, message: 'Fetched successfully.' })
            }
            else res.status(400).send({ data: {}, message: 'Not found.' })
        })
        .catch(err => {
            console.log(err);
        })
})

router.delete('/:id', auth, (req, res) => {
    const { params: { id = '' } = {} } = req;
    if (!id) {
        return res.status(404).json({ message: 'ID does not exists' })
    }
    FleetOwner.findByIdAndDelete(id)
        .then(result => {
            if (result)
                res.status(200).json({ message: 'Deleted successfully!' });
        })
        .catch(err => console.log(err))
})

module.exports = router;