const mongoose = require('mongoose');

const programacionEjecucionSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa', required: true },
  gestion: { type: Number, required: true },
  trimestre: { type: Number, enum: [1, 2, 3, 4] },
  avanceFisicoProgramado: { type: Number, default: 0 },
  avanceFisicoEjecutado: { type: Number, default: 0 },
  avanceFinancieroProgramado: { type: Number, default: 0 },
  avanceFinancieroEjecutado: { type: Number, default: 0 },
  presupuestoAsignado: Number,
  presupuestoEjecutado: { type: Number, default: 0 },
  estado: { type: String, enum: ['PROGRAMADO', 'EN_EJECUCION', 'COMPLETADO', 'OBSERVADO'], default: 'PROGRAMADO' },
  observaciones: String,
  responsable: { type: mongoose.Schema.Types.ObjectId, ref: 'PersonaTecnica' },
}, { timestamps: true });

module.exports = mongoose.model('ProgramacionEjecucion', programacionEjecucionSchema);
