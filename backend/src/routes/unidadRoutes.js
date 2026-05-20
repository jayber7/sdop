const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const UnidadOrganizativa = require('../models/UnidadOrganizativa');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { habilitado } = req.query;
    const filter = {};
    if (habilitado !== undefined) filter.habilitado = habilitado === 'true';
    const unidades = await UnidadOrganizativa.find(filter).populate('jefeId', 'nombreCompleto').sort({ nombre: 1 });
    res.json({ status: 'success', data: unidades });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const unidad = await UnidadOrganizativa.findById(req.params.id).populate('jefeId');
    if (!unidad) return res.status(404).json({ status: 'error', message: 'Unidad no encontrada' });
    res.json({ status: 'success', data: unidad });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const unidad = await UnidadOrganizativa.create(req.body);
    res.status(201).json({ status: 'success', data: unidad });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const unidad = await UnidadOrganizativa.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!unidad) return res.status(404).json({ status: 'error', message: 'Unidad no encontrada' });
    res.json({ status: 'success', data: unidad });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const unidad = await UnidadOrganizativa.findByIdAndDelete(req.params.id);
    if (!unidad) return res.status(404).json({ status: 'error', message: 'Unidad no encontrada' });
    res.json({ status: 'success', message: 'Unidad eliminada' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
