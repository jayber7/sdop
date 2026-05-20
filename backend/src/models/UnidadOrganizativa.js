const mongoose = require('mongoose');

const unidadOrganizativaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  codigo: { type: String, required: true, unique: true },
  descripcion: String,
  jefeId: { type: mongoose.Schema.Types.ObjectId, ref: 'PersonaTecnica' },
  color: { type: String, default: '#1976d2' },
  icono: String,
  planEstrategico: {
    objetivos: [String],
    programas: [String],
    periodo: String,
  },
  habilitado: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('UnidadOrganizativa', unidadOrganizativaSchema);
