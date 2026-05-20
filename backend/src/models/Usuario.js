const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  googleId: String,
  rol: {
    type: String,
    enum: ['ADMIN', 'SUPERVISOR', 'INSPECTOR', 'FISCAL', 'VISOR'],
    default: 'VISOR',
  },
  personaTecnicaId: { type: mongoose.Schema.Types.ObjectId, ref: 'PersonaTecnica' },
  unidadesAcceso: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UnidadOrganizativa' }],
  activo: { type: Boolean, default: true },
  ultimoAcceso: Date,
  intentosFallidos: { type: Number, default: 0 },
  bloqueadoHasta: Date,
}, { timestamps: true });

usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

usuarioSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
