const { default: axios } = require("axios");
const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Facilities = require('../../models/Warehouse');
const getDistanceinKM = require("../../utils/haversine");

router.get('/', auth, (req, res) => {
    const { page = 1, limit = 5 } = req.query;
    Facilities.find()
        .limit(+limit)
        .skip((+page - 1) * limit)
        .then(async warehouses => {
            const totalCount = await Facilities.countDocuments({})
            res.status(200).send({ totalCount, facilities: warehouses })
        })
        .catch(err => {
            console.log(err)
            res.sendStatus(404).json({ totalCount: 0, warehouses: [] })
        })
})

router.post('/', auth, (req, res) => {
    const { body = {} } = req;
    const { _id = null } = body;
    const warehouse = new Facilities(body);
    if (_id) {
        delete body._id
        Facilities.updateOne({ _id }, { ...body })
            .then(response => {
                if (response.ok) {
                    console.log(_id + ' Updated');
                    return res.status(200).json({ message: 'Updated Sucessfully' })
                }
            })
            .catch(err => console.log(err.message));
    }
    else warehouse.save()
        .then(result => {
            res.status(200).send('Warehouse Added');
            console.log('Warehouse Added');
        })
        .catch(err => console.log(err))
})

router.post('/getLocation', auth, (req, res) => {
    const { address = '', state = '', city = '', zip = '' } = req.body
    const combined = address.concat(city).concat(zip);

    axios.get('https://api.opencagedata.com/geocode/v1/json?key=d371fe6c81514ffabb4e141163ddaa60&q=' + combined)
        .then(({ status, data }) => {
            if (status === 200) {
                const { status, results = [] } = data;
                if (status.code === 200) {
                    if (!results.length) {
                        return res.status(200).json({ success: false, message: 'Not Found' })
                    }
                    if (results.length) {
                        return res.status(200).json({ success: true, data: results[0].geometry })
                    }

                }
            }
        });
})

router.post('/distance', (req, res) => {
    const { _id, lat, lng } = req.body;
    console.log(req.body)
    if (_id) {
        Facilities.findById(_id)
            .then(result => {
                const { latitude = '', longitude = '' } = result;
                console.log(latitude, longitude)
                if (latitude && longitude) {
                    const distance = getDistanceinKM(lat, lng, latitude, longitude)
                    res.status(200).send(Math.floor(distance) + ' km')
                }
                else res.status(404).json({ message: "Latitude and Longitude is not found" })
            })
            .catch(err => {
                console.log('Error in /distance: ', err.message)
            })
    }
})

router.delete('/:id', auth, (req, res) => {
    const { params: { id = '' } } = req;
    if (!id) {
        return res.status(404).json({ message: 'ID does not exists' })
    }
    Facilities.findByIdAndDelete(id)
        .then(result => {
            if (result)
                res.status(200).json({ message: 'Deleted successfully!' });
        })
        .catch(err => console.log(err))
})

router.get('/search', auth, (req, res) => {
    const { text = '' } = req.query;
    try {
        if (text) {
            Facilities.find(
                {
                    $or: [
                        {
                            name: {
                                $regex: text,
                                '$options': 'i'
                            }
                        },
                        {
                            address: {
                                $regex: text,
                                '$options': 'i'
                            }
                        },
                        {
                            state: {
                                $regex: text,
                                '$options': 'i'
                            }
                        },
                        {
                            city: {
                                $regex: text,
                                '$options': 'i'
                            }
                        },
                    ]
                }
            )//({ $text: { $search: '.*' + text + '.*' } })
                .then(result => {
                    if (result.length) res.status(200).json(result)
                    else {
                        res.status(404).json({ message: 'Not Found      ' })
                    }
                })
                .catch(err => console.log(err));
        }
    } catch (error) {
        console.log(error.message)
    }
})

router.get('/:id', auth, (req, res) => {
    const { params: { id } } = req;
    Facilities.findById(id)
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

module.exports = router;
