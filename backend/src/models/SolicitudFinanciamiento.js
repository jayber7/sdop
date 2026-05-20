const mongoose = require('mongoose');

const solicitudFinanciamientoSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa', required: true },
  entidadFinanciera: { type: String, enum: ['BID', 'CAF', 'Banco Mundial', 'Gobierno Central', 'Otro'] },
  montoSolicitado: Number,
  moneda: { type: String, enum: ['BOB', 'USD'], default: 'BOB' },
  tipoFinanciamiento: { type: String, enum: ['PRESTAMO', 'DONACION', 'COFINANCIAMIENTO'] },
  proyectoRelacionado: { type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto' },
  estado: { type: String, enum: ['EN_PREPARACION', 'ENVIADA', 'EN_EVALUACION', 'APROBADA', 'RECHAZADA'], default: 'EN_PREPARACION' },
  fechaSolicitud: Date,
  fechaRespuesta: Date,
  observaciones: String,
  documentos: [{ nombre: String, url: String, tipo: String }],
  responsable: { type: mongoose.Schema.Types.ObjectId, ref: 'PersonaTecnica' },
}, { timestamps: true });

module.exports = mongoose.model('SolicitudFinanciamiento', solicitudFinanciamientoSchema);
