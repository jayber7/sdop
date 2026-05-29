const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Migrar índices: eliminar antiguo unique global numeroReporte_1
    // para migrar a índice compuesto proyectoId+numeroReporte
    try {
      await conn.connection.db.collection('avanceobras').dropIndex('numeroReporte_1');
      console.log('Índice antiguo numeroReporte_1 eliminado');
    } catch (e) {
      // El índice puede no existir si es la primera vez o ya se eliminó
      if (e.code !== 27) console.log('Info índices:', e.message);
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.log('El servidor continuará pero las rutas de BD no funcionarán hasta reconectar...');
    // No matar el proceso, intentar reconectar
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
