const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Invoice = require("../../models/Invoice");
const Load = require("../../models/Load");

router.post('/', auth, async (req, res) => {
    try {
        const { from, to, load_id } = req.body;
        const invoice = new Invoice({
            load: load_id,
            from,
            to
        });
        await invoice.save();
        await Load.findOneAndUpdate({ _id: load_id }, { status: 'delivered' });
        return res.json({});
    } catch (err) {
        return res.status(500).send(err.message);
    }
});

module.exports = router;