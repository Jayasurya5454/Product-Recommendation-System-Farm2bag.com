const mongoose = require('mongoose');
require('dotenv').config();

const connectdb = async () => {
  mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected to database');
  }).catch((error) => {
    console.log('Error connecting to database', error);
  });
}

module.exports = connectdb;
