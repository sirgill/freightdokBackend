const OwnerOperatorServiceCost = require("../../models/OwnerOperatorServiceCost");
const { sendJson, sumValuesInObject } = require("../../utils/utils");

const createCost = async (req, res) => {
    const { id } = req.user;
    try {
        const { orgId, ownerOperatorId, lease, truckInsurance, trailerInsurance, eld, parking, additionalCosts, total } = req.body;

        const newCost = new OwnerOperatorServiceCost({
            orgId,
            ownerOperatorId,
            lease,
            truckInsurance,
            trailerInsurance,
            eld,
            parking,
            additionalCosts,
            total,
            createdBy: id,
            updatedBy: id
        });

        const savedCost = await newCost.save();
        res.status(201).json({
            success: true,
            message: 'Owner operator service cost created successfully.',
            data: savedCost,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating owner operator service cost.',
            error: error.message,
        });
    }
}

const createAdditionalCosts = async (req, res) => {
    try {
        const { orgId, id } = req.user;
        const { category } = req.body;

        OwnerOperatorServiceCost.updateMany(
            { orgId },
            { $set: { [`additionalCosts.${category}`]: 0, updatedBy: id } },
            (err, result) => {
                if (err) {
                    res.status(400).json(sendJson(false, err.message));
                } else {
                    res.status(200).json(sendJson(true, 'Category Added'))
                }
            }
        );
    } catch (error) {
        res.status(500).json(sendJson(false, error.message));
    }
}

const getAllCosts = async (req, res) => {
    const { orgId } = req.user;
    try {
        const costs = await OwnerOperatorServiceCost.find({ orgId })
            .populate('orgId', 'name -_id')
            .populate('updatedBy', 'firstName lastName name -_id')
            .populate('ownerOperatorId', 'firstName lastName name -_id');
        res.status(200).json({
            success: true,
            message: 'Owner operator service costs retrieved successfully.',
            data: costs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving owner operator service costs.',
            error: error.message,
        });
    }
}

const getCostById = async (req, res) => {
    try {
        const { id } = req.params;

        const cost = await OwnerOperatorServiceCost.findById(id).populate('orgId').populate('userId');
        if (!cost) {
            return res.status(404).json({
                success: false,
                message: 'Owner operator service cost not found.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Owner operator service cost retrieved successfully.',
            data: cost,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving owner operator service cost.',
            error: error.message,
        });
    }
}

const updateCost = async (req, res) => {
    const { id: _id } = req.user;

    try {
        const { id } = req.params;
        const updates = req.body;
        const form = { ...updates };

        if (typeof form === 'object') {
            delete form.lease;
            const total = sumValuesInObject(form);
            updates.total = total;
        }


        const updatedCost = await OwnerOperatorServiceCost.findByIdAndUpdate(id, { ...updates, updatedBy: _id }, {
            new: true,
            runValidators: true,
        });

        if (!updatedCost) {
            return res.status(404).json({
                success: false,
                message: 'Owner operator service cost not found.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Owner operator service cost updated successfully.',
            data: updatedCost,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating owner operator service cost.',
            error: error.message,
        });
    }
}

const deleteCost = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedCost = await OwnerOperatorServiceCost.findByIdAndDelete(id);
        if (!deletedCost) {
            return res.status(404).json({
                success: false,
                message: 'Owner operator service cost not found.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Owner operator service cost deleted successfully.',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting owner operator service cost.',
            error: error.message,
        });
    }
}

const removeKeyFromAdditionalCosts = async (req, res) => {
    const { key } = req.body;
    const { orgId } = req.user;

    if (!key) {
        return res.status(400).json({ error: "Key to remove is required." });
    }

    try {
        const documents = await OwnerOperatorServiceCost.find({ orgId, [`additionalCosts.${key}`]: { $exists: true } });

        let modifiedCount = 0;

        for (const doc of documents) {
            delete doc.additionalCosts[key];

            const additionalCostsSum = Object.values(doc.additionalCosts).reduce((sum, value) => sum + value, 0);
            doc.total =
                doc.truckInsurance +
                doc.trailerInsurance +
                doc.eld +
                doc.parking +
                additionalCostsSum;

            await doc.save();
            modifiedCount++;
        }

        res.status(200).json({
            message: "Cost removed.",
            modifiedCount,
        });
    } catch (error) {
        console.error("Error removing key from additionalCosts:", error);
        res.status(500).json({ error: "An error occurred while removing the key." });
    }
};


module.exports = {
    createCost,
    getAllCosts,
    getCostById,
    updateCost,
    deleteCost,
    createAdditionalCosts,
    removeKeyFromAdditionalCosts,
};