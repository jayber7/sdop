const mongoose = require('mongoose');

const planContingenciaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  tipoEmergencia: {
    type: String,
    enum: ['INUNDACION', 'SISMO', 'DESLIZAMIENTO', 'SEQUÍA', 'INCENDIO', 'EPIDEMIA', 'OTRO'],
    required: true,
  },
  zona: { type: String, required: true },
  municipio: String,
  provincia: String,
  procedimientos: [{
    paso: Number,
    descripcion: String,
    responsable: String,
  }],
  recursos: [{
    tipo: String,
    cantidad: Number,
    ubicacion: String,
  }],
  responsables: [{
    nombre: String,
    cargo: String,
    telefono: String,
  }],
  puntosEncuentro: [String],
  rutasEvacuacion: [String],
  fechaElaboracion: Date,
  fechaUltimaRevision: Date,
  estado: {
    type: String,
    enum: ['EN_ELABORACION', 'APROBADO', 'EN_REVISION', 'ARCHIVADO'],
    default: 'EN_ELABORACION',
  },
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa' },
  observaciones: String,
}, { timestamps: true });

module.exports = mongoose.model('PlanContingencia', planContingenciaSchema);
