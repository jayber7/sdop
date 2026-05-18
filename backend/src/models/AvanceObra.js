const mongoose = require('mongoose');

const avanceObraSchema = new mongoose.Schema({
  proyectoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto', required: true },
  numeroReporte: { type: String, required: true, unique: true },
  fechaReporte: { type: Date, default: Date.now },
  avanceFisicoParcial: { type: Number, required: true },
  avanceFisicoAcumulado: { type: Number, required: true },
  avanceFinancieroParcial: Number,
  avanceFinancieroAcumulado: Number,
  hitoDescripcion: String,
  actividadesRealizadas: String,
  problemasIdentificados: String,
  clima: {
    type: String,
    enum: ['SOLEADO', 'NUBLADO', 'LLUVIA', 'GRANIZO', 'NIEBLA'],
  },
  fotos: [{
    url: String,
    publicId: String,
    exif: {
      latitud: Number,
      longitud: Number,
      altitud: Number,
      fechaCaptura: Date,
      horaCaptura: String,
      dispositivo: String,
      modeloCamara: String,
      software: String,
      orientacion: String,
      resolucion: { width: Number, height: Number },
      tieneGPS: Boolean,
    },
    verificacion: {
      ubicacionValida: Boolean,
      fechaValida: Boolean,
      distanciaObraMetros: Number,
      radioAceptadoMetros: { type: Number, default: 500 },
      metadataConsistente: Boolean,
      estado: {
        type: String,
        enum: ['VERIFICADO', 'SOSPECHOSO', 'RECHAZADO'],
        default: 'VERIFICADO',
      },
      observaciones: String,
    },
    categoria: {
      type: String,
      enum: ['VISTA_GENERAL', 'DETALLE_CONSTRUCCION', 'MATERIAL', 'EQUIPO', 'PERSONAL', 'ANTES', 'DESPUES'],
      default: 'VISTA_GENERAL',
    },
    descripcion: String,
  }],
  registradoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  aprobadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  fechaAprobacion: Date,
  estado: {
    type: String,
    enum: ['BORRADOR', 'ENVIADO', 'APROBADO', 'OBSERVADO'],
    default: 'BORRADOR',
  },
  observacionesSupervisor: String,
}, { timestamps: true });

module.exports = mongoose.model('AvanceObra', avanceObraSchema);
