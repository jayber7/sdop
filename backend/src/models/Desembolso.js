const mongoose = require('mongoose');

const desembolsoSchema = new mongoose.Schema({
  proyectoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto', required: true },
  hitoId: { type: mongoose.Schema.Types.ObjectId, ref: 'HitoPresupuestario' },
  monto: { type: Number, required: true },
  fechaSolicitud: Date,
  fechaAprobacion: Date,
  fechaDesembolso: Date,
  estado: {
    type: String,
    enum: ['SOLICITADO', 'APROBADO', 'DESEMBOLSADO', 'RECHAZADO'],
    default: 'SOLICITADO',
  },
  comprobantePago: String,
  observaciones: String,
  solicitadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  aprobadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
}, { timestamps: true });

module.exports = mongoose.model('Desembolso', desembolsoSchema);
