const Bids = require("../models/Bids");

// Data structure for ch bid response
/**
 * {
"loadNumber": 0,
"carrierCode": "string",
"offerRequestId": "string",
"offerId": 0,
"offerResult": "Accepted",
"price": 0,
"currencyCode": "string",
"rejectReasons": [
"string"
]
}
 */
function chBidsHook(req, res) {
    const { username, password, messageBody } = req.body
    if (username === 'chrobinson' && password === 'chrobdok@123') {
        const { offerResult = '', loadNumber } = req.body;
        console.log('CH Authorized! \nSaving Bid response--loadNumber:' + loadNumber);
        Bids.findOneAndUpdate(
            { loadNumber },
            { event_data: req.body, offerStatus: offerResult, bidLevel: 1 }
        ).then((response) => {
            if (response) {
                return res.status(202).send({ success: true, message: "bid response submitted to freightdok successfully!" });
            }
            throw new Error('Bid not found');
        }).catch(err => {
            console.log('Error saving ch response at web hook', err.message);
            return res.status(500).json({ success: false, message: 'Error' });
        })
    }
    else {
        res.status(401).send({ success: false, message: "User Not Authorized to publish messages to this handle" });
    }
}

module.exports = chBidsHook;