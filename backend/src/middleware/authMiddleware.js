const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ status: 'error', message: 'No autorizado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sdop-jwt-secret');
    const usuario = await Usuario.findById(decoded.id).select('-password');

    if (!usuario || !usuario.activo) {
      return res.status(401).json({ status: 'error', message: 'Usuario no válido' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    res.status(401).json({ status: 'error', message: 'Token inválido' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.usuario.rol !== 'ADMIN') {
    return res.status(403).json({ status: 'error', message: 'Requiere rol de administrador' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
