const mongoose = require('mongoose');

const proyectoSchema = new mongoose.Schema({
  codigoSisin: { type: String, sparse: true },
  codigoInterno: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  tipo: {
    type: String,
    enum: ['CAMINO', 'PUENTE', 'ELECTRIFICACION', 'AGUA_POTABLE', 'SANEAMIENTO', 'EDIFICACION', 'OTRO'],
    required: true,
  },
  departamento: { type: String, default: 'Oruro' },
  provincia: String,
  municipio: String,
  comunidad: String,
  coordenadas: {
    lat: Number,
    lng: Number,
  },
  presupuestoTotal: { type: Number, required: true },
  fuenteFinanciamiento: {
    type: String,
    enum: ['TGN', 'IDH', 'COMPETENCIA', 'CREDITO', 'OTRO'],
  },
  moneda: { type: String, default: 'BOB' },
  estado: {
    type: String,
    enum: ['PRE_INVERSION', 'DISEÑO', 'LICITACION', 'EJECUCION', 'SUSPENDIDO', 'CONCLUIDO', 'ENTREGADO'],
    default: 'PRE_INVERSION',
  },
  estadoLicitacion: {
    type: String,
    enum: ['CONVOCATORIA', 'ADJUDICADA', 'DECLARADA_DESIERTA', 'CONTRATADA'],
  },
  empresaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa' },
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'PersonaTecnica' },
  inspectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'PersonaTecnica' },
  fiscalId: { type: mongoose.Schema.Types.ObjectId, ref: 'PersonaTecnica' },
  fechaInicioContrato: Date,
  fechaFinContrato: Date,
  plazoDias: Number,
  diasProrroga: { type: Number, default: 0 },
  fechaInicioEjecucion: Date,
  fechaFinEjecucion: Date,
  numeroContrato: String,
  modalidadContratacion: {
    type: String,
    enum: ['CONVOCATORIA_PUBLICA', 'CONTRATACION_DIRECTA', 'MENOR'],
  },
  garantiaContrato: Number,
  avanceFisico: { type: Number, default: 0 },
  avanceFinanciero: { type: Number, default: 0 },
  ultimoAvanceFecha: Date,
  documentos: {
    diseno: [String],
    contrato: [String],
    garantia: [String],
    actaEntrega: [String],
    otros: [{ url: String, descripcion: String }],
  },
  observaciones: String,
}, { timestamps: true });

module.exports = mongoose.model('Proyecto', proyectoSchema);
