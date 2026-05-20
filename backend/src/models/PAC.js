const mongoose = require('mongoose');

const pacSchema = new mongoose.Schema({
  gestion: { type: Number, required: true },
  nombre: { type: String, required: true },
  contrataciones: [{
    codigo: String,
    descripcion: String,
    modalidad: {
      type: String,
      enum: ['CONVOCATORIA_PUBLICA', 'CONTRATACION_DIRECTA', 'MENOR', 'LICITACION'],
    },
    montoEstimado: Number,
    fechaProgramada: Date,
    estado: {
      type: String,
      enum: ['PROGRAMADO', 'EN_PROCESO', 'ADJUDICADO', 'CONCLUIDO'],
    },
    proyectoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto' },
  }],
  montoTotal: Number,
  estado: {
    type: String,
    enum: ['EN_ELABORACION', 'APROBADO', 'EN_EJECUCION', 'CONCLUIDO'],
    default: 'EN_ELABORACION',
  },
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa' },
  observaciones: String,
}, { timestamps: true });

module.exports = mongoose.model('PAC', pacSchema);
