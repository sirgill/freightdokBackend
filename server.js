require('dotenv').config()
const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const seeder = require('./seeder');
const morgan = require("morgan")
const { newtrulWebhook } = require('./routes/api/newtrulWebhooks');
const { catchErrors } = require('./utils/utils');
const { schedulers } = require('./utils/schedulers');
const chBidsHook = require('./webhooks/chBids');
const corsAnywhere = require('cors-anywhere');
const BEInvoices = require('./routes/api/triumph-bank-sftp/be-invoices');
const Invoice_v2 = require('./models/Invoice_v2');
const auth = require('./middleware/auth');





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

app.use('/api/organizations', require('./routes/api/organizations'));
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
app.use('/api/carrierProfile', require('./routes/api/fmcsa'));
app.use('/api/chRobinson', require('./routes/api/chRobinson'));
app.use('/api/newtrulLoad', require('./routes/api/newTrulLoad'));
app.use('/api/loadHistory', require('./routes/api/loadHistory'));
app.use('/api/loadStatuses', require('./routes/api/loadStatuses'));
/**
 * Route deprecated.
 */
// app.use('/api/register', require('./routes/api/register'))
app.use('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, '/documents/privacyPolicy', 'Privacy_Policy.html'))
});
app.use('/api/searchLocationAutocomplete', require('./routes/api/searchLocationAutocomplete'))
app.use('/api/onboarding', require('./routes/api/onBoarding'));
app.use('/api/forgotPassword', require('./routes/api/forgotPasswordOtp'));
app.use('/api/roles', require('./routes/api/defaultRolePermission'));
app.use('/api/rolePermission', require('./routes/api/rolePermission'));

// ---------------------------------------------------------------------------
//$NEWBOOKBIDWEBHOOK-$7867*/
app.post('/newtrul/webhook/v1/request_status_update', newtrulWebhook);
app.post("/handle-ch-bids", chBidsHook);
// ---------------------------------------------------------------------------


app.post("/create-be-invoice-pdf", auth, BEInvoices)

app.post('/api/create-invoicev2', auth, async (req, res) => {
  const { orgId, id, orgName } = req.user;
  const { loadNumber, notes, services } = req.body;
  try {
    // Create a new invoice entry

    const newInvoice = new Invoice_v2({
      orgId,
      loadNumber,
      notes,
      services,
      orgName,
      userId: id
    });

    // Save the invoice to the database
    const savedInvoice = await newInvoice.save();

    res.status(201).json({ success: true, message: 'Saved Successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating invoice', error });
  }
});



app.get('/', (req, res) => res.send('API Running'));


const PORT = process.env.PORT || 5000;


const host = '0.0.0.0';
const corsPORT = 3432;

corsAnywhere.createServer({
  originWhitelist: [], // Allow all origins
}).listen(corsPORT, host, () => {
  console.log(`CORS Anywhere server is running on ${host}:${corsPORT}`);
});

app.listen(PORT, () => {
  catchErrors();
  schedulers();
  console.log(`Server Started on port ${PORT}`)
});

