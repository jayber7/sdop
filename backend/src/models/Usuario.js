const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: String,
  googleId: String,
  rol: {
    type: String,
    enum: ['ADMIN', 'SUPERVISOR', 'INSPECTOR', 'FISCAL', 'VISOR'],
    default: 'VISOR',
  },
  personaTecnicaId: { type: mongoose.Schema.Types.ObjectId, ref: 'PersonaTecnica' },
  activo: { type: Boolean, default: true },
  ultimoAcceso: Date,
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
