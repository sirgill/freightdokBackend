const express = require("express");
const auth = require("../../middleware/auth");
const Load = require("../../models/Load");
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 100, search = '' } = req.query;
        const to_search = search.toLowerCase();
        const regex = { $regex: to_search, $options: 'i' };
        const query = {
            status: { $in: ['archived'] },
            $or: [
                { loadNumber: regex },
                { "pickup.pickupCity": regex },
                { "pickup.pickupState": regex },
                { "drop.dropCity": regex },
                { "drop.dropState": regex },
            ]
        }
        const totalCountPromise = Load.countDocuments(query);

        // Find the requested page of loads with pagination
        const loads = await Load.find(query)
            .limit(+limit)
            .skip((page - 1) * limit)
            .populate('user', 'firstName lastName name email')
            .sort({ updatedAt: -1 })
            .exec();

        const [totalCount, loadsData] = await Promise.all([totalCountPromise, loads]);

        res.status(200).json({ data: loadsData, totalCount });
    } catch (error) {
        console.error(error.message)
        res.status(400).json({ message: error.message, data: [] });
    }
})

module.exports = router;