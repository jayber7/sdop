const mongoose = require('mongoose');

const licenciaVehiculoSchema = new mongoose.Schema({
  placa: { type: String, required: true, unique: true },
  tipoVehiculo: {
    type: String,
    enum: ['BUS', 'MINIBUS', 'MICRO', 'TAXI', 'TRUFIS', 'CAMION', 'OTRO'],
    required: true,
  },
  propietario: { type: String, required: true },
  ciPropietario: String,
  ruta: String,
  linea: String,
  estado: {
    type: String,
    enum: ['ACTIVO', 'SUSPENDIDO', 'INACTIVO'],
    default: 'ACTIVO',
  },
  fechaEmision: Date,
  fechaVencimiento: Date,
  municipio: String,
  observaciones: String,
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa' },
}, { timestamps: true });

module.exports = mongoose.model('LicenciaVehiculo', licenciaVehiculoSchema);
