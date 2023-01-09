require('dotenv').config()
const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const seeder = require('./seeder');
const morgan = require("morgan")
const multipart = require('connect-multiparty');
const NewTrulLoad = require('./models/newTrulLoad');
const Bids = require('./models/Bids');

const app = express();

//Connect Database
connectDB();
//Create Admin
seeder();

// const multipartMiddleware = multipart({ maxFieldsSize: (20 * 1024 * 1024) });


// Convert 
// app.use(multipartMiddleware);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, './documents/load')));
app.use(express.static(path.join(__dirname, './documents')));
app.use(express.static(path.join(__dirname, './documents/privacyPolicy')));
app.use(morgan('dev'))

app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/load', require('./routes/api/load'));
app.use('/api/drivers', require('./routes/api/drivers'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/invoice', require('./routes/api/invoice'));
app.use('/api/warehouse', require('./routes/api/warehouse'));
app.use('/api/vendors', require('./routes/api/vendors'))
app.use('/api/bid', require('./routes/api/bidding'));
app.use('/api/fleetOwner', require('./routes/api/fleetOwner'));
app.use('/api/ownerOperator', require('./routes/api/ownerOperator'));
app.use('/api/fmcsa', require('./routes/api/fmcsa'));
app.use('/api/chRobinson', require('./routes/api/chRobinson'));
app.use('/api/newtrulLoad', require('./routes/api/newTrulLoad'));
app.use('/api/register', require('./routes/api/register'))
app.use('/privacy-policy', (req, res) => {
    res.sendFile(path.join(__dirname, '/documents/privacyPolicy', 'Privacy_Policy.html'))
});

// ---------------------------------------------------------------------------
//$NEWBOOKBIDWEBHOOK-$7867*/
app.post('/newtrul/webhook/v1/request_status_update', (req, res) => {
    const { event_type, event_data: { load: { id } } } = req.body
    try {
        const { load: { id = '' }, counter_offer: { amount = '' } = {} } = event_data;

        let wbIsBooked = false
        if (event_type === 'BOOK_LOAD_SUCCESS') {
            wbIsBooked = true
            NewTrulLoad.updateOne({ loadNumber: id }, { wbIsBooked })
                .then(response => {
                    if (response) {
                        res.status(200).json({ success: true, message: 'Load Status Updated at freightdok successfully !' })
                    }
                })
        }

        if (event_type === 'OFFER_ACCEPTED') {
            Bids.updateOne({ loadNumber: id }, { status: true, offerStatus: event_type, event_data })
                .then(resp => res.status(200).json({ success: true, message: 'Offer Status Updated at freightdok successfully !' }))
            return;
        } else if (event_type === 'OFFER_REJECTED') {
            Bids.updateOne({ loadNumber: id }, { status: false, offerStatus: event_type, event_data })
                .then(resp => res.status(200).json({ success: true, message: 'Offer Status Updated at freightdok successfully !' }))
            return;
        }
        else if (event_type === 'COUNTER_OFFER_CREATED') {
            Bids.findOne({ loadNumber: id })
                .then(resp => {
                    let { bidAmount } = resp;
                    bidAmount = bidAmount + "," + amount;
                    Bids.updateOne({ loadNumber: id }, { status: false, offerStatus: event_type, event_data, bidLevel: 2, bidAmount })
                        .then(resp => res.status(200).json({ success: true, message: 'Offer Status Updated at freightdok successfully !' }))
                    return;
                })
        }
        else if (event_type === 'FINAL_OFFER_CREATED') {
            Bids.findOne({ loadNumber: id })
                .then(resp => {
                    const { final_offer: { amount = undefined } = {} } = event_data;
                    let { bidAmount } = resp;
                    bidAmount = bidAmount + "," + amount;
                    Bids.updateOne({ loadNumber: id }, { status: false, offerStatus: event_type, event_data, bidLevel: 3, bidAmount })
                        .then(() => res.status(200).json({ success: true, message: 'Offer Status Updated at freightdok successfully !' }))
                    return;
                })
        }
        else {
            res.status(200).json({ success: true, message: 'Offer Status Updated at freightdok successfully !' })
        }
    }
    catch (err) {
        res.status(200).json({ success: true, message: "event_type Acknowledged! at freightdok" })
    }
});
// ---------------------------------------------------------------------------

app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server Started on port ${PORT}`));
