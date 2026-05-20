const mongoose = require('mongoose');

const presupuestoBaseSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa', required: true },
  gestion: { type: Number, required: true },
  tipoPresupuesto: { type: String, enum: ['BASE', 'FLUJO_EFECTIVIDAD'], default: 'BASE' },
  montoTotal: Number,
  montoEjecutado: { type: Number, default: 0 },
  partidas: [{
    codigo: String,
    descripcion: String,
    montoAsignado: Number,
    montoEjecutado: { type: Number, default: 0 },
  }],
  flujosMensuales: [{
    mes: { type: Number, enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    montoProgramado: Number,
    montoEjecutado: { type: Number, default: 0 },
  }],
  estado: { type: String, enum: ['ELABORACION', 'APROBADO', 'EN_EJECUCION', 'CERRADO'], default: 'ELABORACION' },
  responsable: { type: mongoose.Schema.Types.ObjectId, ref: 'PersonaTecnica' },
}, { timestamps: true });

module.exports = mongoose.model('PresupuestoBase', presupuestoBaseSchema);
