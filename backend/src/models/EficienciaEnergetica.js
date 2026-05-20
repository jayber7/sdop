const mongoose = require('mongoose');

const eficienciaEnergeticaSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  edificio: { type: String, required: true },
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa', required: true },
  municipio: String,
  tipoEdificio: { type: String, enum: ['OFICINA_GUBERNAMENTAL', 'ESCUELA', 'HOSPITAL', 'OTRO'] },
  consumoActualKwh: Number,
  consumoObjetivoKwh: Number,
  ahorroEstimadoPorcentaje: Number,
  medidas: [{
    descripcion: String,
    costoEstimado: Number,
    ahorroEstimado: Number,
    estado: { type: String, enum: ['PROPUESTA', 'APROBADA', 'EN_EJECUCION', 'COMPLETADA'], default: 'PROPUESTA' },
  }],
  diagnosticoFecha: Date,
  estado: { type: String, enum: ['DIAGNOSTICO', 'PLANIFICACION', 'EN_EJECUCION', 'COMPLETADO'], default: 'DIAGNOSTICO' },
  responsable: { type: mongoose.Schema.Types.ObjectId, ref: 'PersonaTecnica' },
}, { timestamps: true });

module.exports = mongoose.model('EficienciaEnergetica', eficienciaEnergeticaSchema);
