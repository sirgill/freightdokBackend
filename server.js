require('dotenv').config()
const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const seeder = require('./seeder');
const morgan = require("morgan")
const multipart = require('connect-multiparty');
const { newtrulWebhook } = require('./routes/api/newtrulWebhooks');
const { catchErrors } = require('./utils/utils');
const Bids = require('./models/Bids');
var cron = require('node-cron');
const moment = require('moment')


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
app.use('/api/searchLocationAutocomplete', require('./routes/api/searchLocationAutocomplete'))
app.use('/api/onboarding', require('./routes/api/onBoarding'));

// ---------------------------------------------------------------------------
//$NEWBOOKBIDWEBHOOK-$7867*/
app.post('/newtrul/webhook/v1/request_status_update', newtrulWebhook);
// ---------------------------------------------------------------------------

app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000;

cron.schedule('* * * * *', async () => {
    try {
        console.log('running a task every minute');
        const dt = await Bids.find({ offerStatus: "OFFER_REJECTED", isActive: true });
        const update_active_status_ids = [];
        await Promise.all(dt.map(bid => {
            const last_updated_at = moment(bid.updatedAt)
            const current_date = moment();
            const diff_in_days = moment.duration(current_date.diff(last_updated_at)).days()
            if (diff_in_days) {
                console.log(bid._id)
                update_active_status_ids.push(bid._id);
            }
        }))
        console.log('active status', update_active_status_ids)
        if (update_active_status_ids.length)
            Bids.updateMany({ _id: { $in: update_active_status_ids } }, { isActive: false }, (err, docs) => {
                if (!err)
                    console.log("Successfully Updated ! Entries to inActive")
            });
    }
    catch (err) {
        console.log("Err ", err.message)
    }

});

app.listen(PORT, () => {
    catchErrors();
    console.log(`Server Started on port ${PORT}`)
});
