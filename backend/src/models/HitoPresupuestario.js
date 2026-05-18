const mongoose = require('mongoose');

const hitoPresupuestarioSchema = new mongoose.Schema({
  proyectoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto', required: true },
  numero: Number,
  descripcion: String,
  avanceFisicoMinimo: Number,
  montoAsociado: Number,
  estado: {
    type: String,
    enum: ['PENDIENTE', 'CUMPLIDO', 'PAGADO', 'RECHAZADO'],
    default: 'PENDIENTE',
  },
  avanceObraVinculado: { type: mongoose.Schema.Types.ObjectId, ref: 'AvanceObra' },
  fechaCumplimiento: Date,
  fechaPago: Date,
}, { timestamps: true });

module.exports = mongoose.model('HitoPresupuestario', hitoPresupuestarioSchema);
