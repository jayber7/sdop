const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const Proyecto = require('../models/Proyecto');
const Empresa = require('../models/Empresa');
const PersonaTecnica = require('../models/PersonaTecnica');
const HitoPresupuestario = require('../models/HitoPresupuestario');
const Desembolso = require('../models/Desembolso');

// PROYECTOS
router.get('/proyectos', authMiddleware, async (req, res) => {
  try {
    const { estado, tipo, municipio, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (estado) filter.estado = estado;
    if (tipo) filter.tipo = tipo;
    if (municipio) filter.municipio = new RegExp(municipio, 'i');

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [proyectos, total] = await Promise.all([
      Proyecto.find(filter)
        .populate('empresaId', 'nombre')
        .populate('supervisorId', 'nombreCompleto')
        .populate('inspectorId', 'nombreCompleto')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Proyecto.countDocuments(filter),
    ]);

    res.json({ status: 'success', data: proyectos, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.get('/proyectos/:id', authMiddleware, async (req, res) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id)
      .populate('empresaId')
      .populate('supervisorId')
      .populate('inspectorId')
      .populate('fiscalId');
    if (!proyecto) return res.status(404).json({ status: 'error', message: 'Proyecto no encontrado' });
    res.json({ status: 'success', data: proyecto });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/proyectos', authMiddleware, async (req, res) => {
  try {
    const proyecto = await Proyecto.create(req.body);
    res.status(201).json({ status: 'success', data: proyecto });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/proyectos/:id', authMiddleware, async (req, res) => {
  try {
    const proyecto = await Proyecto.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!proyecto) return res.status(404).json({ status: 'error', message: 'Proyecto no encontrado' });
    res.json({ status: 'success', data: proyecto });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/proyectos/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const proyecto = await Proyecto.findByIdAndDelete(req.params.id);
    if (!proyecto) return res.status(404).json({ status: 'error', message: 'Proyecto no encontrado' });
    res.json({ status: 'success', message: 'Proyecto eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// EMPRESAS
router.get('/empresas', authMiddleware, async (req, res) => {
  try {
    const empresas = await Empresa.find({ habilitado: true }).sort({ nombre: 1 });
    res.json({ status: 'success', data: empresas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/empresas', authMiddleware, async (req, res) => {
  try {
    const empresa = await Empresa.create(req.body);
    res.status(201).json({ status: 'success', data: empresa });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/empresas/:id', authMiddleware, async (req, res) => {
  try {
    const empresa = await Empresa.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!empresa) return res.status(404).json({ status: 'error', message: 'Empresa no encontrada' });
    res.json({ status: 'success', data: empresa });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// PERSONAS TECNICAS
router.get('/personas-tecnicas', authMiddleware, async (req, res) => {
  try {
    const { rol } = req.query;
    const filter = { habilitado: true };
    if (rol) filter.rol = rol;
    const personas = await PersonaTecnica.find(filter).sort({ nombreCompleto: 1 });
    res.json({ status: 'success', data: personas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/personas-tecnicas', authMiddleware, async (req, res) => {
  try {
    const persona = await PersonaTecnica.create(req.body);
    res.status(201).json({ status: 'success', data: persona });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/personas-tecnicas/:id', authMiddleware, async (req, res) => {
  try {
    const persona = await PersonaTecnica.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!persona) return res.status(404).json({ status: 'error', message: 'Persona no encontrada' });
    res.json({ status: 'success', data: persona });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// HITOS PRESUPUESTARIOS
router.get('/hitos', authMiddleware, async (req, res) => {
  try {
    const { proyectoId } = req.query;
    const filter = {};
    if (proyectoId) filter.proyectoId = proyectoId;
    const hitos = await HitoPresupuestario.find(filter).sort({ numero: 1 });
    res.json({ status: 'success', data: hitos });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/hitos', authMiddleware, async (req, res) => {
  try {
    const hito = await HitoPresupuestario.create(req.body);
    res.status(201).json({ status: 'success', data: hito });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/hitos/:id', authMiddleware, async (req, res) => {
  try {
    const hito = await HitoPresupuestario.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!hito) return res.status(404).json({ status: 'error', message: 'Hito no encontrado' });
    res.json({ status: 'success', data: hito });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// DESEMBOLSOS
router.get('/desembolsos', authMiddleware, async (req, res) => {
  try {
    const { proyectoId } = req.query;
    const filter = {};
    if (proyectoId) filter.proyectoId = proyectoId;
    const desembolsos = await Desembolso.find(filter).populate('hitoId').sort({ fechaSolicitud: -1 });
    res.json({ status: 'success', data: desembolsos });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/desembolsos', authMiddleware, async (req, res) => {
  try {
    const desembolso = await Desembolso.create({ ...req.body, fechaSolicitud: new Date() });
    res.status(201).json({ status: 'success', data: desembolso });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/desembolsos/:id', authMiddleware, async (req, res) => {
  try {
    const desembolso = await Desembolso.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!desembolso) return res.status(404).json({ status: 'error', message: 'Desembolso no encontrado' });
    res.json({ status: 'success', data: desembolso });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
