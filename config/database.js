const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log("Connecting to:>>>", process.env.MONGODB_URI);
    const conn = await mongoose.connect('mongodb://localhost:27017/own-the-digital');
    // const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/own-the-digital');

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
