const mongoose = require('mongoose');

const plantaTratamientoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  tipo: {
    type: String,
    enum: ['PTAR', 'PTAP', 'LAGUNA_ESTABILIZACION'],
    required: true,
  },
  capacidadM3Dia: Number,
  ubicacion: { type: String, required: true },
  municipio: String,
  provincia: String,
  coordenadas: { lat: Number, lng: Number },
  estado: {
    type: String,
    enum: ['OPERATIVA', 'EN_CONSTRUCCION', 'EN_MANTENIMIENTO', 'FUERA_SERVICIO'],
    default: 'OPERATIVA',
  },
  comunidadesBeneficiadas: [String],
  poblacionBeneficiada: Number,
  fechaInicioOperacion: Date,
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa' },
  observaciones: String,
}, { timestamps: true });

module.exports = mongoose.model('PlantaTratamiento', plantaTratamientoSchema);
