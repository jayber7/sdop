const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const { authMiddleware } = require('../middleware/authMiddleware');
const extractExifMiddleware = require('../middleware/exifExtractor');
const geoVerificationMiddleware = require('../middleware/geoVerification');
const AvanceObra = require('../models/AvanceObra');
const Proyecto = require('../models/Proyecto');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'sdop/avances',
    format: async (req, file) => 'jpg',
    transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// LISTAR AVANCES
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { proyectoId, estado, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (proyectoId) filter.proyectoId = proyectoId;
    if (estado) filter.estado = estado;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [avances, total] = await Promise.all([
      AvanceObra.find(filter)
        .populate('proyectoId', 'nombre codigoInterno')
        .populate('registradoPor', 'nombre email')
        .populate('aprobadoPor', 'nombre email')
        .sort({ fechaReporte: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AvanceObra.countDocuments(filter),
    ]);

    res.json({ status: 'success', data: avances, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// OBTENER AVANCE POR ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const avance = await AvanceObra.findById(req.params.id)
      .populate('proyectoId')
      .populate('registradoPor')
      .populate('aprobadoPor');
    if (!avance) return res.status(404).json({ status: 'error', message: 'Avance no encontrado' });
    res.json({ status: 'success', data: avance });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// SUBIR FOTO CON VERIFICACION (HIBRIDO: camara o archivo)
router.post('/upload', authMiddleware, upload.single('foto'), extractExifMiddleware, geoVerificationMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No se recibió ninguna imagen' });
    }

    const fotoData = {
      url: req.file.path,
      publicId: req.file.filename,
      exif: req.exifData || null,
      verificacion: req.verificacion,
      categoria: req.body.categoria || 'VISTA_GENERAL',
      descripcion: req.body.descripcion || '',
    };

    res.json({ status: 'success', data: fotoData });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// CREAR AVANCE DE OBRA
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { proyectoId, fotos, ...avanceData } = req.body;

    const proyecto = await Proyecto.findById(proyectoId);
    if (!proyecto) return res.status(404).json({ status: 'error', message: 'Proyecto no encontrado' });

    const year = new Date().getFullYear();
    const count = await AvanceObra.countDocuments({ proyectoId });
    const numeroReporte = `AV-${year}-${String(proyecto.codigoInterno).slice(-3).padStart(3, '0')}-${String(count + 1).padStart(3, '0')}`;

    const avance = await AvanceObra.create({
      ...avanceData,
      proyectoId,
      numeroReporte,
      fotos: fotos || [],
      registradoPor: req.usuario._id,
      estado: 'ENVIADO',
    });

    res.status(201).json({ status: 'success', data: avance });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// ACTUALIZAR AVANCE
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const avance = await AvanceObra.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!avance) return res.status(404).json({ status: 'error', message: 'Avance no encontrado' });
    res.json({ status: 'success', data: avance });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// APROBAR AVANCE (supervisor)
router.put('/:id/aprobar', authMiddleware, async (req, res) => {
  try {
    if (req.usuario.rol !== 'ADMIN' && req.usuario.rol !== 'SUPERVISOR') {
      return res.status(403).json({ status: 'error', message: 'Solo supervisores pueden aprobar' });
    }

    const avance = await AvanceObra.findById(req.params.id).populate('proyectoId');
    if (!avance) return res.status(404).json({ status: 'error', message: 'Avance no encontrado' });

    avance.estado = 'APROBADO';
    avance.aprobadoPor = req.usuario._id;
    avance.fechaAprobacion = new Date();
    avance.observacionesSupervisor = req.body.observaciones || '';
    await avance.save();

    // Actualizar avance consolidado del proyecto
    if (avance.proyectoId) {
      const ultimoAvance = await AvanceObra.findOne({ proyectoId: avance.proyectoId, estado: 'APROBADO' }).sort({ avanceFisicoAcumulado: -1 });
      if (ultimoAvance) {
        await Proyecto.findByIdAndUpdate(avance.proyectoId, {
          avanceFisico: ultimoAvance.avanceFisicoAcumulado,
          avanceFinanciero: ultimoAvance.avanceFinancieroAcumulado,
          ultimoAvanceFecha: new Date(),
        });
      }
    }

    res.json({ status: 'success', data: avance });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// OBSERVAR AVANCE (supervisor)
router.put('/:id/observar', authMiddleware, async (req, res) => {
  try {
    if (req.usuario.rol !== 'ADMIN' && req.usuario.rol !== 'SUPERVISOR') {
      return res.status(403).json({ status: 'error', message: 'Solo supervisores pueden observar' });
    }

    const avance = await AvanceObra.findByIdAndUpdate(
      req.params.id,
      { estado: 'OBSERVADO', aprobadoPor: req.usuario._id, observacionesSupervisor: req.body.observaciones },
      { new: true }
    );
    if (!avance) return res.status(404).json({ status: 'error', message: 'Avance no encontrado' });
    res.json({ status: 'success', data: avance });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// ESTADISTICAS DE AVANCES
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { proyectoId } = req.query;
    const filter = {};
    if (proyectoId) filter.proyectoId = proyectoId;

    const [total, aprobados, enviados, observados] = await Promise.all([
      AvanceObra.countDocuments(filter),
      AvanceObra.countDocuments({ ...filter, estado: 'APROBADO' }),
      AvanceObra.countDocuments({ ...filter, estado: 'ENVIADO' }),
      AvanceObra.countDocuments({ ...filter, estado: 'OBSERVADO' }),
    ]);

    res.json({ status: 'success', data: { total, aprobados, enviados, observados } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
