const mongoose = require('mongoose');

const redElectricaSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  tipo: {
    type: String,
    enum: ['DISTRIBUCION', 'TRANSMISION', 'SUBESTACION'],
    required: true,
  },
  longitudKm: Number,
  voltaje: String,
  comunidadesBeneficiadas: [String],
  estado: {
    type: String,
    enum: ['OPERATIVA', 'EN_CONSTRUCCION', 'EN_MANTENIMIENTO', 'FUERA_SERVICIO'],
    default: 'OPERATIVA',
  },
  municipio: String,
  provincia: String,
  coordenadas: [{ lat: Number, lng: Number }],
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa' },
  observaciones: String,
}, { timestamps: true });

module.exports = mongoose.model('RedElectrica', redElectricaSchema);
