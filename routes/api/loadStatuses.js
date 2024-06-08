const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const LoadStatuses = require("../../models/loadStatuses");

router.get('/', auth, async (req, res) => {
    try {
        const statuses = await LoadStatuses.find({}).select('label id -_id');
        res.status(200).json({ data: statuses, totalCount: statuses.length });
    } catch (error) {
        res.status(400).json({ data: [], message: 'No Load Status found', _dbError: error.message });
    }
})

router.post('/bulkUpdate', auth, async (req, res) => {
    try {
        const status = await LoadStatuses.insertMany(req.body);
        res.send(status);
    } catch (error) {
        res.send(error.message);
    }
})

module.exports = router;