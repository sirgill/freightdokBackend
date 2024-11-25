const EFSTransactionRates = require("../../models/EFSTransactionRates");

const createRate = async (req, res) => {
    const { minAmount, maxAmount, transactionCost } = req.body;
    const { id, orgId } = req.user;

    try {
        // Validate input
        if (minAmount >= maxAmount) {
            return res.status(400).json({ error: 'minAmount must be less than maxAmount.' });
        }

        const rate = new EFSTransactionRates({ minAmount, maxAmount, transactionCost, createdBy: id, orgId: orgId });
        const savedRate = await rate.save();

        res.status(201).json({ message: 'Rate created successfully', data: savedRate });
    } catch (error) {
        console.error('Error creating rate:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getAllRates = async (req, res) => {
    const { orgId } = req.user;
    try {
        const rates = await EFSTransactionRates.find({ orgId }).sort({ minAmount: 1 })
            .select('minAmount maxAmount transactionCost');
        res.status(200).json({ data: rates });
    } catch (error) {
        console.error('Error fetching rates:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getRateByAmount = async (req, res) => {
    const { id } = req.params;

    try {
        const rate = await EFSTransactionRates.findById(id);

        if (!rate) {
            return res.status(404).json({ error: 'No rate found for the given amount.' });
        }

        res.status(200).json({ data: rate });
    } catch (error) {
        console.error('Error fetching rate by amount:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateRate = async (req, res) => {
    const { id } = req.params;
    const { id: _id, orgId } = req.user;
    const { minAmount, maxAmount } = req.body;

    try {
        // Validate input
        if (minAmount >= maxAmount) {
            return res.status(400).json({ error: 'minAmount must be less than maxAmount.' });
        }

        const updatedRate = await EFSTransactionRates.findByIdAndUpdate(
            id,
            { ...req.body, updatedBy: _id, orgId },
            { new: true, runValidators: true }
        );

        if (!updatedRate) {
            return res.status(404).json({ error: 'Rate not found.' });
        }

        res.status(200).json({ message: 'Rate updated successfully', data: updatedRate });
    } catch (error) {
        console.error('Error updating rate:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteRate = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedRate = await EFSTransactionRates.findByIdAndDelete(id);

        if (!deletedRate) {
            return res.status(404).json({ error: 'Rate not found.' });
        }

        res.status(200).json({ message: 'Rate deleted successfully' });
    } catch (error) {
        console.error('Error deleting rate:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    deleteRate,
    createRate,
    updateRate,
    getAllRates,
    getRateByAmount
}