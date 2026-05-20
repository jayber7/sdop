const mongoose = require('mongoose');

const proyectoEnergiaRenovableSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  tipo: {
    type: String,
    enum: ['SOLAR', 'EOLICA', 'HIDROELECTRICA', 'BIOMASA', 'GEOTERMICA'],
    required: true,
  },
  capacidadKW: { type: Number, required: true },
  ubicacion: { type: String, required: true },
  municipio: String,
  provincia: String,
  coordenadas: { lat: Number, lng: Number },
  estado: {
    type: String,
    enum: ['PRE_INVERSION', 'DISENO', 'EN_CONSTRUCCION', 'OPERATIVA', 'SUSPENDIDA'],
    default: 'PRE_INVERSION',
  },
  presupuestoEstimado: Number,
  fuenteFinanciamiento: {
    type: String,
    enum: ['TGN', 'IDH', 'COMPETENCIA', 'CREDITO', 'OTRO'],
  },
  fechaInicio: Date,
  fechaFinEstimada: Date,
  comunidadesBeneficiadas: [String],
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa' },
  observaciones: String,
}, { timestamps: true });

module.exports = mongoose.model('ProyectoEnergiaRenovable', proyectoEnergiaRenovableSchema);
