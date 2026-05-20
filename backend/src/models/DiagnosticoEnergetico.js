const mongoose = require('mongoose');

const diagnosticoEnergeticoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  zona: { type: String, required: true },
  municipio: String,
  provincia: String,
  consumoActualKW: Number,
  demandaProyectadaKW: Number,
  deficit: Number,
  cobertura: { type: Number, min: 0, max: 100 },
  recomendaciones: [String],
  fechaElaboracion: Date,
  estado: {
    type: String,
    enum: ['EN_ELABORACION', 'APROBADO', 'ARCHIVADO'],
    default: 'EN_ELABORACION',
  },
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa' },
  observaciones: String,
}, { timestamps: true });

module.exports = mongoose.model('DiagnosticoEnergetico', diagnosticoEnergeticoSchema);
