// backend/src/config/db.js
const mongoose = require('mongoose');
require('colors');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sociosphere');
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    return true;
  } catch (error) {
    console.warn(`MongoDB connection failed: ${error.message}`.yellow);
    console.warn('Running in mock mode without database'.yellow);
    return false;
  }
};

module.exports = connectDB;