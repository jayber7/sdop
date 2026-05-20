const mongoose = require('mongoose');

const mantenimientoVialSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  redVialId: { type: mongoose.Schema.Types.ObjectId, ref: 'RedVial', required: true },
  tipo: {
    type: String,
    enum: ['RUTINARIO', 'PERIODICO', 'EMERGENCIA', 'MEJORAMIENTO'],
    required: true,
  },
  descripcion: { type: String, required: true },
  fechaInicio: Date,
  fechaFin: Date,
  costo: Number,
  empresaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa' },
  estado: {
    type: String,
    enum: ['PROGRAMADO', 'EN_EJECUCION', 'CONCLUIDO', 'SUSPENDIDO'],
    default: 'PROGRAMADO',
  },
  municipio: String,
  longitudIntervenidaKm: Number,
  observaciones: String,
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa' },
}, { timestamps: true });

module.exports = mongoose.model('MantenimientoVial', mantenimientoVialSchema);
