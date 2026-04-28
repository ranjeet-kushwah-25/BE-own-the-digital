const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    // Try MongoDB Atlas first, fallback to localhost if it fails
    let conn;
    try {
      conn = await mongoose.connect(mongoUri);
    
    } catch (atlasError) {
      console.warn('MongoDB Atlas connection failed, trying localhost:', atlasError.message);
      conn = await mongoose.connect('mongodb://localhost:27017/own-the-digital');

    }
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
