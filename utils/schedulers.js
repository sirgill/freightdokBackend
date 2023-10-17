const Bids = require('../models/Bids');
var cron = require('node-cron');
const moment = require('moment')

const schedulers = () => {
    cron.schedule('* 1 * * *', async () => {
        try {
            console.log('running cron job hour', new Date().toLocaleTimeString());
            const dt = await Bids.find({ offerStatus: "OFFER_REJECTED", isActive: true });
            const rejectedIds = [];
            await Promise.all(dt.map(bid => {
                const last_updated_at = moment(bid.updatedAt)
                const current_date = moment();
                const diff_in_days = moment.duration(current_date.diff(last_updated_at)).days()
                if (diff_in_days) {
                    console.log(bid._id)
                    rejectedIds.push(bid._id);
                }
            }))
            console.log('active status', rejectedIds)
            if (rejectedIds.length)
                Bids.updateMany({ _id: { $in: rejectedIds } }, { isActive: false }, (err, docs) => {
                    if (!err)
                        console.log("Successfully Updated Entries to inActive")
                });
        }
        catch (err) {
            console.log("Err ", err.message)
        }

    });
}

module.exports = {
    schedulers
}