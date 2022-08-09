const axios = require('axios');
const express = require('express')
const router = express.Router();

router.post('/ownerOperator', async (req, res) => {
    const { name, email, phone, companyname: dot, content } = req.body;
    res.send(200)
})

router.post('/fleetOwner', (req, res) => {

})

module.exports = router