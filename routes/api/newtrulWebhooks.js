
const NewTrulLoad = require('../../models/newTrulLoad');
const Bids = require('../../models/Bids');

const newtrulWebhook = (req, res) => {
    const { event_type, event_data: { load: { id = '' } = {} } = {} } = req.body
    const { event_data } = req.body
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
    console.log("+++++++++++++++ Webhook Response +++++++++++++++")
    console.log('event_type', event_type);
    console.log(req.body)
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
    try {
        const { load: { id = '' }, counter_offer: { amount = '' } = {} } = event_data;

        if (event_type === 'BOOK_LOAD_SUCCESS') {
            let wbIsBooked = true
            NewTrulLoad.updateOne({ loadNumber: id }, { wbIsBooked, event_data })
                .then(response => {
                    if (response) {
                        res.status(200).json({ success: true, message: 'Load Status Updated at freightdok successfully !' })
                        return;
                    }
                })
        }
        else if (event_type === 'OFFER_ACCEPTED' || event_type === 'ACCEPT_COUNTER_OFFER_SUCCESS' || event_type === 'ACCEPT_FINAL_OFFER_SUCCESS') {
            Bids.updateOne({ loadNumber: id }, { status: true, offerStatus: 'OFFER_ACCEPTED', event_data })
                .then(resp => res.status(200).json({ success: true, message: 'Offer Status Updated at freightdok successfully !' }))
            return;
        } else if (event_type === 'OFFER_REJECTED' || event_type === 'REJECT_COUNTER_OFFER_SUCCESS' || event_type === 'REJECT_FINAL_OFFER_SUCCESS') {
            Bids.updateOne({ loadNumber: id }, { status: false, offerStatus: 'OFFER_REJECTED', event_data })
                .then(resp => res.status(200).json({ success: true, message: 'Offer Status Updated at freightdok successfully !' }))
            return;
        }
        else if (event_type === 'COUNTER_OFFER_CREATED') {
            const { } = event_data
            Bids.findOne({ loadNumber: id })
                .then(resp => {
                    let { bidAmount } = resp;
                    bidAmount = bidAmount + "," + amount;
                    Bids.updateOne({ loadNumber: id }, { status: false, offerStatus: event_type, event_data, bidLevel: 2, bidAmount })
                        .then(resp => res.status(200).json({ success: true, message: 'Counter Offer Created at freightdok successfully !' }))
                    return;
                })
        }
        else if (event_type === 'FINAL_OFFER_CREATED') {
            Bids.findOne({ loadNumber: id })
                .then(resp => {
                    if (resp) {
                        const { final_offer: { amount = undefined } = {} } = event_data;
                        let { bidAmount } = resp;
                        bidAmount = bidAmount + "," + amount;
                        Bids.updateOne({ loadNumber: id }, { status: false, offerStatus: event_type, event_data, bidLevel: 3, bidAmount })
                            .then(() => res.status(200).json({ success: true, message: 'Offer Status Updated at freightdok successfully !' }))
                        return;
                    } else {
                        res.status(404).json({ success: false, message: 'Load Id not found' })
                    }
                })
        }
        else {
            // res.status(200).json({ success: true, message: 'Offer Status Updated at freightdok successfully !' })
        }
    }
    catch (err) {
        console.log(err.message)
        res.status(200).json({ success: true, message: "Error at freightdok" })
    }
}

module.exports = {
    newtrulWebhook
}
