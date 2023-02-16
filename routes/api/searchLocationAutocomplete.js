const auth = require("../../middleware/auth");
const express = require("express");
const { default: axios } = require("axios");
const router = express.Router();

router.get('/', auth, async (req, res) => {
    const { search = '' } = req.query;

    if (!search) {
        return res.status(405).json('Please provide search text')
    }

    const result = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + search + '&types=geocode&key=' + process.env.GOOGLE_PLACES)
    if (result.data.status === 'OK') {
        return res.status(200).json(result.data);
    }
    res.status(400).json(result.data);
})

module.exports = router;