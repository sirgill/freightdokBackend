const OwnerOperatorServiceCost = require("../../models/OwnerOperatorServiceCost");

const createDefaultServiceCost = async ({ ownerOperatorId, orgId, reqUserId }, callback) => {
    const doc = await OwnerOperatorServiceCost.find({ orgId });
    let additionalCosts = {};

    if (doc.length) {
        const { additionalCosts: addCosts } = doc[0];
        for (let key in addCosts) {
            additionalCosts[key] = 0
        }
    }
    try {
        const newCost = new OwnerOperatorServiceCost({
            orgId,
            ownerOperatorId,
            lease: 0,
            truckInsurance: 0,
            trailerInsurance: 0,
            eld: 0,
            parking: 0,
            additionalCosts,
            total: 0,
            createdBy: reqUserId,
            updatedBy: reqUserId
        });

        const savedCost = await newCost.save();
        if (savedCost) {
            if (callback) {
                callback(null, savedCost);
            }
            return true;
        }
    } catch (error) {
        if (callback) {
            callback(error, null)
        }
        return false;
    }
}

module.exports = {
    createDefaultServiceCost
}