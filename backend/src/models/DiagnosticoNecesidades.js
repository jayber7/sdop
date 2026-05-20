const mongoose = require('mongoose');

const diagnosticoNecesidadesSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  sector: {
    type: String,
    enum: ['INFRAESTRUCTURA', 'TRANSPORTE', 'ENERGIA', 'SANEAMIENTO', 'EDIFICACION'],
    required: true,
  },
  municipio: String,
  provincia: String,
  necesidades: [{
    descripcion: String,
    prioridad: {
      type: String,
      enum: ['ALTA', 'MEDIA', 'BAJA'],
    },
    presupuestoEstimado: Number,
  }],
  presupuestoTotalEstimado: Number,
  fechaElaboracion: Date,
  estado: {
    type: String,
    enum: ['EN_ELABORACION', 'APROBADO', 'ARCHIVADO'],
    default: 'EN_ELABORACION',
  },
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa' },
  observaciones: String,
}, { timestamps: true });

module.exports = mongoose.model('DiagnosticoNecesidades', diagnosticoNecesidadesSchema);
