const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const validateOrgId = require("../../middleware/validateOrgId");
const FactoringPartners = require("../../models/factoringPartners");

router.get('/', auth, async (req, res) => {
    const { orgId } = req.user;
    const { page = 1, limit = 10 } = req.query
    try {
        const factoringPartners = await FactoringPartners.find({ orgId })
            .limit(+limit)
            .skip((page - 1) * limit)
            .populate('orgId', 'name -_id')
        res.status(200).json({ data: factoringPartners });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

router.get('/:id', auth, async (req, res) => {
    const { orgId } = req.user;
    try {
        const factoringPartner = await FactoringPartners.findOne({ _id: req.params.id, status: true, orgId }).populate('orgId', 'name -_id');
        if (!factoringPartner) {
            return res.status(404).json({ message: 'Factoring Partner not found or inactive' });
        }
        res.status(200).json(factoringPartner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

router.post('/', auth, validateOrgId, async (req, res) => {
    const { orgId } = req.user;

    try {
        const newFactoringPartner = new FactoringPartners({ ...req.body, orgId });
        const savedFactoringPartner = await newFactoringPartner.save();
        res.status(201).json({ data: savedFactoringPartner, success: true, message: 'Saved successfully' });
    } catch (error) {
        res.status(400).json({ _dbError: error.message, message: '' });
    }
})

router.put('/:id', auth, validateOrgId, async (req, res) => {
    try {

        const updatedFactoringPartner = await FactoringPartners.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedFactoringPartner) return res.status(404).json({ message: 'Factoring Partner not found' });
        res.status(200).json({ message: 'Updated Successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

router.delete('/:id', auth, validateOrgId, async (req, res) => {
    try {
        const updatedFactoringPartner = await FactoringPartners.findByIdAndUpdate(
            req.params.id,
            { status: false }
        );
        if (!updatedFactoringPartner) {
            return res.status(404).json({ message: 'Factoring Partner not found' });
        }
        res.status(200).json({ message: 'Factoring Partner marked as inactive' });
    } catch (error) {
        res.status(500).json({ message: error.message, message: 'Server Error. Please try later' });
    }
})

module.exports = router;