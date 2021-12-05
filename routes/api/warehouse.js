const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Warehouse = require('../../models/Warehouse');

router.get('/', (req, res) => {
    Warehouse.find()
        .then(warehouses => {
            res.status(200).send({ totalCount: warehouses.length, warehouses })
        })
        .catch(err => {
            console.log(err)
            res.sendStatus(404).json({ totalCount: 0, warehouses: [] })
        })
})

router.post('/', auth, (req, res) => {
    const { body = {} } = req;
    const { _id = null } = body;
    const warehouse = new Warehouse(body);
    if (_id) {
        delete body._id
        Warehouse.updateOne({ _id }, { ...body })
            .then(response => {
                if (response.ok) {
                    console.log(id + ' Updated');
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

router.get('/:id', auth, (req, res) => {
    const { params: { id } } = req;
    Warehouse.findById(id)
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

router.delete('/', auth, (req, res) => {

})

module.exports = router;