const mongoose = require('mongoose');

const redAguaPotableSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  tipo: {
    type: String,
    enum: ['ADUCCION', 'DISTRIBUCION', 'CONEXIONES_DOMICILIARIAS'],
    required: true,
  },
  longitudKm: Number,
  diametro: String,
  material: {
    type: String,
    enum: ['PVC', 'HDPE', 'HIERRO', 'COBRE', 'OTRO'],
  },
  comunidades: [String],
  estado: {
    type: String,
    enum: ['OPERATIVA', 'EN_CONSTRUCCION', 'EN_MANTENIMIENTO', 'FUERA_SERVICIO'],
    default: 'OPERATIVA',
  },
  caudalLPS: Number,
  municipio: String,
  provincia: String,
  coordenadas: [{ lat: Number, lng: Number }],
  poblacionBeneficiada: Number,
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa' },
  observaciones: String,
}, { timestamps: true });

module.exports = mongoose.model('RedAguaPotable', redAguaPotableSchema);
