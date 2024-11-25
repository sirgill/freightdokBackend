const OwnerOperatorServiceCost = require("../../models/OwnerOperatorServiceCost");

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

module.exports = {
    createCost,
    getAllCosts,
    getCostById,
    updateCost,
    deleteCost,
};