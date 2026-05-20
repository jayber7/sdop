const mongoose = require('mongoose');

const planCoberturaSaneamientoSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa', required: true },
  municipio: String,
  provincia: String,
  tipoSaneamiento: { type: String, enum: ['AGUA_POTABLE', 'ALCANTARILLADO', 'AMBOS'] },
  coberturaActualPorcentaje: Number,
  coberturaObjetivoPorcentaje: Number,
  poblacionBeneficiaria: Number,
  familiasBeneficiarias: Number,
  acciones: [{
    descripcion: String,
    tipo: { type: String, enum: ['CONSTRUCCION', 'MEJORAMIENTO', 'AMPLIACION'] },
    costoEstimado: Number,
    plazo: String,
    estado: { type: String, enum: ['PROPUESTA', 'APROBADA', 'EN_EJECUCION', 'COMPLETADA'], default: 'PROPUESTA' },
  }],
  estado: { type: String, enum: ['ELABORACION', 'APROBADO', 'EN_EJECUCION', 'COMPLETADO'], default: 'ELABORACION' },
  fechaAprobacion: Date,
  responsable: { type: mongoose.Schema.Types.ObjectId, ref: 'PersonaTecnica' },
}, { timestamps: true });

module.exports = mongoose.model('PlanCoberturaSaneamiento', planCoberturaSaneamientoSchema);
