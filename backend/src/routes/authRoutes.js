const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { authMiddleware } = require('../middleware/authMiddleware');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, rol: user.rol, unidadesAcceso: user.unidadesAcceso },
    process.env.JWT_SECRET || 'sdop-jwt-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
};

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email y contraseña son requeridos' });
    }

    const usuario = await Usuario.findOne({ email: email.toLowerCase() });
    if (!usuario) {
      return res.status(401).json({ status: 'error', message: 'Credenciales incorrectas' });
    }

    if (usuario.bloqueadoHasta && usuario.bloqueadoHasta > new Date()) {
      const minutosRestantes = Math.ceil((usuario.bloqueadoHasta - new Date()) / 60000);
      return res.status(403).json({
        status: 'error',
        message: `Cuenta bloqueada. Intente nuevamente en ${minutosRestantes} minutos`,
      });
    }

    const esValido = await usuario.comparePassword(password);
    if (!esValido) {
      usuario.intentosFallidos = (usuario.intentosFallidos || 0) + 1;

      if (usuario.intentosFallidos >= 5) {
        usuario.bloqueadoHasta = new Date(Date.now() + 15 * 60 * 1000);
        usuario.intentosFallidos = 0;
      }

      await usuario.save();
      return res.status(401).json({ status: 'error', message: 'Credenciales incorrectas' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ status: 'error', message: 'Cuenta desactivada. Contacte al administrador' });
    }

    usuario.intentosFallidos = 0;
    usuario.bloqueadoHasta = null;
    usuario.ultimoAcceso = new Date();
    await usuario.save();

    const token = generateToken(usuario);

    res.json({
      status: 'success',
      data: {
        token,
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          unidadesAcceso: usuario.unidadesAcceso,
          activo: usuario.activo,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/cambiar-password', authMiddleware, async (req, res) => {
  try {
    const { passwordActual, passwordNuevo } = req.body;

    if (!passwordActual || !passwordNuevo) {
      return res.status(400).json({ status: 'error', message: 'Ambas contraseñas son requeridas' });
    }

    const usuario = await Usuario.findById(req.usuario._id);
    const esValido = await usuario.comparePassword(passwordActual);

    if (!esValido) {
      return res.status(401).json({ status: 'error', message: 'Contraseña actual incorrecta' });
    }

    usuario.password = passwordNuevo;
    await usuario.save();

    res.json({ status: 'success', message: 'Contraseña actualizada' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({ status: 'success', data: req.usuario });
});

router.post('/logout', authMiddleware, (req, res) => {
  res.json({ status: 'success', message: 'Sesión cerrada' });
});

module.exports = router;
