const mongoose = require('mongoose');

const capacitacionSimulacroSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  unidadResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa', required: true },
  tipo: { type: String, enum: ['CAPACITACION', 'SIMULACRO', 'TALLER'], default: 'CAPACITACION' },
  tema: String,
  municipio: String,
  fechaProgramada: Date,
  fechaRealizada: Date,
  participantes: Number,
  participantesObjetivo: Number,
  duracion: String,
  facilitador: String,
  materiales: [{ nombre: String, url: String }],
  evaluacion: {
    satisfaccion: Number,
    aprendizaje: Number,
    observaciones: String,
  },
  estado: { type: String, enum: ['PROGRAMADO', 'EN_PREPARACION', 'REALIZADO', 'CANCELADO'], default: 'PROGRAMADO' },
  responsable: { type: mongoose.Schema.Types.ObjectId, ref: 'PersonaTecnica' },
}, { timestamps: true });

module.exports = mongoose.model('CapacitacionSimulacro', capacitacionSimulacroSchema);
