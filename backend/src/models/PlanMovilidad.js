const mongoose = require('mongoose');

const planMovilidadSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa', required: true },
  ambito: { type: String, enum: ['URBANO', 'RURAL', 'INTERURBANO'] },
  municipio: String,
  diagnostico: String,
  objetivos: [String],
  acciones: [{
    descripcion: String,
    prioridad: { type: String, enum: ['ALTA', 'MEDIA', 'BAJA'], default: 'MEDIA' },
    plazo: String,
    costoEstimado: Number,
    estado: { type: String, enum: ['PROPUESTA', 'APROBADA', 'EN_EJECUCION', 'COMPLETADA'], default: 'PROPUESTA' },
  }],
  indicadores: [{
    nombre: String,
    valorBase: Number,
    valorObjetivo: Number,
    valorActual: Number,
  }],
  estado: { type: String, enum: ['ELABORACION', 'APROBADO', 'EN_EJECUCION', 'COMPLETADO'], default: 'ELABORACION' },
  fechaAprobacion: Date,
  responsable: { type: mongoose.Schema.Types.ObjectId, ref: 'PersonaTecnica' },
}, { timestamps: true });

module.exports = mongoose.model('PlanMovilidad', planMovilidadSchema);
