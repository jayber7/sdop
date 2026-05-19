const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const Feedback = require('../models/Feedback');
const Usuario = require('../models/Usuario');

// ============================================================
// RUTAS ESPECÍFICAS (deben ir ANTES de las rutas con :id)
// ============================================================

// ESTADISTICAS DE FEEDBACK
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [total, abiertos, enProgreso, resueltos, porTipo] = await Promise.all([
      Feedback.countDocuments(),
      Feedback.countDocuments({ estado: 'ABIERTO' }),
      Feedback.countDocuments({ estado: 'EN_PROGRESO' }),
      Feedback.countDocuments({ estado: 'RESUELTO' }),
      Feedback.aggregate([
        { $group: { _id: '$tipo', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      status: 'success',
      data: {
        total,
        abiertos,
        enProgreso,
        resueltos,
        porTipo: porTipo.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// CREAR FEEDBACK (cualquier usuario autenticado)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tipo, titulo, descripcion, pagina, prioridad, screenshot } = req.body;

    const feedback = await Feedback.create({
      tipo,
      titulo,
      descripcion,
      pagina: pagina || 'Desconocida',
      prioridad: prioridad || 'MEDIA',
      usuarioId: req.usuario._id,
      screenshot,
    });

    res.status(201).json({ status: 'success', data: feedback });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// LISTAR FEEDBACKS
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { estado, tipo, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (estado) filter.estado = estado;
    if (tipo) filter.tipo = tipo;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter)
        .populate('usuarioId', 'nombre email')
        .populate('respondidoPor', 'nombre email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Feedback.countDocuments(filter),
    ]);

    res.json({ status: 'success', data: feedbacks, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============================================================
// RUTAS CON :id (deben ir AL FINAL)
// ============================================================

// OBTENER FEEDBACK POR ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('usuarioId', 'nombre email')
      .populate('respondidoPor', 'nombre email');
    if (!feedback) return res.status(404).json({ status: 'error', message: 'Feedback no encontrado' });
    res.json({ status: 'success', data: feedback });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ACTUALIZAR ESTADO
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { estado, respuesta } = req.body;

    const updateData = { estado };
    if (respuesta) {
      updateData.respuesta = respuesta;
      updateData.respondidoPor = req.usuario._id;
      updateData.fechaRespuesta = new Date();
    }

    const feedback = await Feedback.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!feedback) return res.status(404).json({ status: 'error', message: 'Feedback no encontrado' });
    res.json({ status: 'success', data: feedback });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
