const mongoose = require('mongoose');

const gestionResiduosSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  zona: { type: String, required: true },
  municipio: String,
  provincia: String,
  tipo: {
    type: String,
    enum: ['RECOLECCION', 'DISPOSICION_FINAL', 'RECICLAJE', 'COMPOSTAJE'],
    required: true,
  },
  frecuenciaRecojo: {
    type: String,
    enum: ['DIARIO', 'INTERDIARIO', 'SEMANAL', 'QUINCENAL'],
  },
  toneladasDia: Number,
  rutas: [{
    nombre: String,
    descripcion: String,
    longitudKm: Number,
  }],
  estado: {
    type: String,
    enum: ['OPERATIVO', 'EN_PLANIFICACION', 'SUSPENDIDO'],
    default: 'OPERATIVO',
  },
  poblacionBeneficiada: Number,
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa' },
  observaciones: String,
}, { timestamps: true });

module.exports = mongoose.model('GestionResiduos', gestionResiduosSchema);
