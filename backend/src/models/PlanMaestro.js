const mongoose = require('mongoose');

const planMaestroSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  periodo: { type: String, required: true },
  descripcion: String,
  objetivos: [String],
  proyectosVinculados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto' }],
  presupuestoEstimado: Number,
  estado: {
    type: String,
    enum: ['EN_ELABORACION', 'APROBADO', 'EN_EJECUCION', 'CONCLUIDO'],
    default: 'EN_ELABORACION',
  },
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa' },
  observaciones: String,
}, { timestamps: true });

module.exports = mongoose.model('PlanMaestro', planMaestroSchema);
