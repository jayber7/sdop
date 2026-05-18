const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.log('El servidor continuará pero las rutas de BD no funcionarán hasta reconectar...');
    // No matar el proceso, intentar reconectar
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
