const mongoose = require('mongoose');

const personaTecnicaSchema = new mongoose.Schema({
  nombreCompleto: { type: String, required: true },
  ci: { type: String, required: true, unique: true },
  profesion: String,
  matriculaProfesional: String,
  especialidad: {
    type: String,
    enum: ['CAMINOS', 'PUENTES', 'ELECTRIFICACION', 'SANEAMIENTO', 'GENERAL'],
  },
  experienciaAnios: Number,
  rol: {
    type: String,
    enum: ['SUPERVISOR', 'INSPECTOR', 'FISCAL'],
    required: true,
  },
  habilitado: { type: Boolean, default: true },
  telefono: String,
  email: String,
  proyectosAsignados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto' }],
}, { timestamps: true });

module.exports = mongoose.model('PersonaTecnica', personaTecnicaSchema);
