const mongoose = require('mongoose');

const gestionAmbientalSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa', required: true },
  proyectoRelacionado: { type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto' },
  municipio: String,
  tipoEvaluacion: { type: String, enum: ['EIA', 'AUDITORIA', 'MONITOREO', 'PLAN_MANEJO'] },
  componente: { type: String, enum: ['AGUA', 'SUELO', 'AIRE', 'FLORA', 'FAUNA', 'SOCIOECONOMICO'] },
  impactoIdentificado: String,
  nivelImpacto: { type: String, enum: ['BAJO', 'MEDIO', 'ALTO', 'CRITICO'] },
  medidasMitigacion: [{
    descripcion: String,
    costoEstimado: Number,
    estado: { type: String, enum: ['PROPUESTA', 'APROBADA', 'EN_EJECUCION', 'COMPLETADA'], default: 'PROPUESTA' },
  }],
  estado: { type: String, enum: ['EN_EVALUACION', 'APROBADO', 'EN_EJECUCION', 'CUMPLIDO', 'OBSERVADO'], default: 'EN_EVALUACION' },
  fechaEvaluacion: Date,
  fechaCumplimiento: Date,
  responsable: { type: mongoose.Schema.Types.ObjectId, ref: 'PersonaTecnica' },
}, { timestamps: true });

module.exports = mongoose.model('GestionAmbiental', gestionAmbientalSchema);
