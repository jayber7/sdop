const mongoose = require('mongoose');

const portafolioProyectoSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  tipo: { type: String, enum: ['FICHA_TECNICA', 'PRE_INVERSION', 'DISEÑO_FINAL'], default: 'FICHA_TECNICA' },
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa', required: true },
  municipio: String,
  provincia: String,
  descripcion: String,
  beneficiarios: Number,
  presupuestoEstimado: Number,
  estado: { type: String, enum: ['EN_ELABORACION', 'REVISION', 'APROBADO', 'ARCHIVADO'], default: 'EN_ELABORACION' },
  fechaElaboracion: Date,
  fechaAprobacion: Date,
  responsable: { type: mongoose.Schema.Types.ObjectId, ref: 'PersonaTecnica' },
  documentos: [{ nombre: String, url: String, tipo: String }],
  observaciones: String,
}, { timestamps: true });

module.exports = mongoose.model('PortafolioProyecto', portafolioProyectoSchema);
