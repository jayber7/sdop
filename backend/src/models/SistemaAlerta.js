const mongoose = require('mongoose');

const sistemaAlertaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  tipo: {
    type: String,
    enum: ['INUNDACION', 'SISMO', 'DESLIZAMIENTO', 'SEQUÍA', 'INCENDIO', 'MULTIPLE'],
    required: true,
  },
  zonaCobertura: { type: String, required: true },
  municipio: String,
  provincia: String,
  mecanismo: {
    type: String,
    enum: ['SIRENA', 'SMS', 'RADIO', 'APP', 'COMUNITARIO', 'MIXTO'],
  },
  estado: {
    type: String,
    enum: ['ACTIVO', 'INACTIVO', 'EN_MANTENIMIENTO', 'EN_INSTALACION'],
    default: 'INACTIVO',
  },
  ultimoTest: Date,
  frecuenciaTest: String,
  poblacionCubierta: Number,
  coordenadas: [{ lat: Number, lng: Number }],
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa' },
  observaciones: String,
}, { timestamps: true });

module.exports = mongoose.model('SistemaAlerta', sistemaAlertaSchema);
