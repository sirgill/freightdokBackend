const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Invoice = require("../../models/Invoice");
const Load = require("../../models/Load");

router.post('/moveToMyLoads', auth, (req, res) => {
    const { id, status } = req.body;
    Load.findOneAndUpdate({ _id: id }, { status, invoice_created: false }, null, (err, result) => {
        if (err) {
            res.status(400).json({ message: 'Could not Update Status', _dbError: err.message })
        } else {
            res.status(201).json({ message: 'Successfully Updated' })
        }
    })
})

router.post('/', auth, async (req, res) => {
    try {
        const { from, to, load_id } = req.body;
        const invoice = new Invoice({
            load: load_id,
            from,
            orgId: req.user.orgId,
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