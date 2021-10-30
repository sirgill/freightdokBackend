require('dotenv').config()
const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const seeder = require('./seeder');
const morgan=require("morgan")

const app = express();

//Connect Database
connectDB();
//Create Admin
seeder();

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cors());
app.use(express.static(path.join(__dirname, './documents/load')));
app.use(express.static(path.join(__dirname, './documents')));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/load', require('./routes/api/load'));
app.use('/api/drivers', require('./routes/api/drivers'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/invoice', require('./routes/api/invoice'));

app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server Started on port ${PORT}`));
