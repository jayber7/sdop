const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { rol, activo, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (rol) filter.rol = rol;
    if (activo !== undefined) filter.activo = activo === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [usuarios, total] = await Promise.all([
      Usuario.find(filter)
        .select('-password')
        .populate('unidadesAcceso', 'nombre codigo color')
        .populate('personaTecnicaId', 'nombreCompleto rol')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Usuario.countDocuments(filter),
    ]);

    res.json({ status: 'success', data: usuarios, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id)
      .select('-password')
      .populate('unidadesAcceso', 'nombre codigo color')
      .populate('personaTecnicaId', 'nombreCompleto rol');
    if (!usuario) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    res.json({ status: 'success', data: usuario });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { nombre, email, password, rol, unidadesAcceso, personaTecnicaId } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Nombre, email y contraseña son requeridos' });
    }

    const existente = await Usuario.findOne({ email: email.toLowerCase() });
    if (existente) {
      return res.status(400).json({ status: 'error', message: 'Ya existe un usuario con ese email' });
    }

    const usuario = await Usuario.create({
      nombre,
      email: email.toLowerCase(),
      password,
      rol: rol || 'VISOR',
      unidadesAcceso: unidadesAcceso || [],
      personaTecnicaId: personaTecnicaId || null,
      activo: true,
    });

    const usuarioSinPassword = await Usuario.findById(usuario._id)
      .select('-password')
      .populate('unidadesAcceso', 'nombre codigo color')
      .populate('personaTecnicaId', 'nombreCompleto rol');

    res.status(201).json({ status: 'success', data: usuarioSinPassword });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { nombre, rol, unidadesAcceso, personaTecnicaId, password } = req.body;

    const updateData = { nombre, rol, unidadesAcceso, personaTecnicaId };
    if (password) {
      updateData.password = password;
    }

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .select('-password')
      .populate('unidadesAcceso', 'nombre codigo color')
      .populate('personaTecnicaId', 'nombreCompleto rol');

    if (!usuario) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    res.json({ status: 'success', data: usuario });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/:id/activar', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { activo } = req.body;
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { activo, intentosFallidos: 0, bloqueadoHasta: null },
      { new: true }
    ).select('-password');

    if (!usuario) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    res.json({ status: 'success', data: usuario });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    if (req.params.id === req.usuario._id.toString()) {
      return res.status(400).json({ status: 'error', message: 'No puedes eliminar tu propio usuario' });
    }

    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
    res.json({ status: 'success', message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [total, activos, porRol] = await Promise.all([
      Usuario.countDocuments(),
      Usuario.countDocuments({ activo: true }),
      Usuario.aggregate([{ $group: { _id: '$rol', count: { $sum: 1 } } }]),
    ]);

    res.json({
      status: 'success',
      data: {
        total,
        activos,
        inactivos: total - activos,
        porRol: porRol.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
