const mongoose = require('mongoose');

const empresaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  nit: { type: String, required: true, unique: true },
  representanteLegal: String,
  ciRepresentante: String,
  especialidades: [{
    type: String,
    enum: ['CAMINOS', 'PUENTES', 'ELECTRIFICACION', 'AGUA_POTABLE', 'SANEAMIENTO', 'EDIFICACION', 'GENERAL'],
  }],
  categoria: {
    type: String,
    enum: ['PEQUEÑA', 'MEDIANA', 'GRANDE'],
  },
  registroSICOPI: String,
  habilitado: { type: Boolean, default: true },
  direccion: String,
  telefono: String,
  email: String,
  totalObrasEjecutadas: { type: Number, default: 0 },
  obrasEnCurso: { type: Number, default: 0 },
  calificacionPromedio: { type: Number, min: 1, max: 5 },
  documentos: [{
    tipo: { type: String, enum: ['NIT', 'REGISTRO', 'LICENCIA', 'GARANTIA'] },
    url: String,
    fechaVencimiento: Date,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Empresa', empresaSchema);
