const mongoose = require('mongoose');

const mapaRiesgoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  tipo: {
    type: String,
    enum: ['INUNDACION', 'SISMO', 'DESLIZAMIENTO', 'SEQUÍA', 'GRANIZADA', 'HELADA', 'INCENDIO', 'OTRO'],
    required: true,
  },
  zona: { type: String, required: true },
  municipio: String,
  provincia: String,
  nivelRiesgo: {
    type: String,
    enum: ['MUY_ALTO', 'ALTO', 'MEDIO', 'BAJO'],
    required: true,
  },
  geojson: Object,
  coordenadas: [{ lat: Number, lng: Number }],
  areaAfectadaKm2: Number,
  poblacionExpuesta: Number,
  recomendaciones: [String],
  fechaElaboracion: Date,
  estado: {
    type: String,
    enum: ['EN_ELABORACION', 'APROBADO', 'ACTUALIZADO', 'ARCHIVADO'],
    default: 'EN_ELABORACION',
  },
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa' },
  observaciones: String,
}, { timestamps: true });

module.exports = mongoose.model('MapaRiesgo', mapaRiesgoSchema);
