const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const server = '127.0.0.1:27017'
const local = `mongodb://${server}/freightdok_local`

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });

    console.log('MongoDB Connected...');
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.error('System seems to be offline. Please check your connection.')
    }
    else console.error("DB ERR:", err.message);
    //Exit process with failure
    process.exit(1);

  }
};

module.exports = connectDB;
