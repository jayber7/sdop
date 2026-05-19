const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['BUG', 'MEJORA', 'NUEVA_FUNCIONALIDAD', 'OTRO'],
    required: true,
  },
  titulo: { type: String, required: true, maxlength: 100 },
  descripcion: { type: String, required: true, maxlength: 1000 },
  pagina: String,
  prioridad: {
    type: String,
    enum: ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'],
    default: 'MEDIA',
  },
  estado: {
    type: String,
    enum: ['ABIERTO', 'EN_PROGRESO', 'RESUELTO', 'CERRADO', 'RECHAZADO'],
    default: 'ABIERTO',
  },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  screenshot: String,
  respuesta: String,
  respondidoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  fechaRespuesta: Date,
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
