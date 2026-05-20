const mongoose = require('mongoose');

const redVialSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  tipo: {
    type: String,
    enum: ['DEPARTAMENTAL', 'MUNICIPAL', 'VECINAL'],
    required: true,
  },
  origen: String,
  destino: String,
  longitudKm: { type: Number, required: true },
  anchoPromedioM: Number,
  superficie: {
    type: String,
    enum: ['ASFALTO', 'RIPADO', 'GRAVA', 'TIERRA', 'ADOQUIN'],
  },
  estado: {
    type: String,
    enum: ['BUENO', 'REGULAR', 'MALO', 'CRITICO'],
    default: 'REGULAR',
  },
  coordenadas: [{ lat: Number, lng: Number }],
  municipio: String,
  provincia: String,
  observaciones: String,
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa' },
}, { timestamps: true });

module.exports = mongoose.model('RedVial', redVialSchema);
