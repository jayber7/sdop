const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const extractExifMiddleware = require('../middleware/exifExtractor');
const geoVerificationMiddleware = require('../middleware/geoVerification');
const AvanceObra = require('../models/AvanceObra');
const Proyecto = require('../models/Proyecto');
const Counter = require('../models/Counter');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'sdop/avances',
    format: async (req, file) => 'jpg',
    transformation: [{ quality: 'auto:good', fetch_format: 'jpg' }],
  },
});

const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// ============================================================
// RUTAS ESPECÍFICAS (deben ir ANTES de las rutas con :id)
// ============================================================

// ESTADISTICAS DE AVANCES
router.get('/stats', authMiddleware, requirePermission('avances', 'read'), async (req, res) => {
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

// SUBIR FOTO CON VERIFICACION (HIBRIDO: camara o archivo)
router.post('/upload', authMiddleware, requirePermission('avances', 'create'), upload.single('foto'), extractExifMiddleware, geoVerificationMiddleware, async (req, res) => {
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

// ============================================================
// RUTAS DE COLECCIÓN (sin :id)
// ============================================================

// LISTAR AVANCES
router.get('/', authMiddleware, requirePermission('avances', 'read'), async (req, res) => {
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

// CREAR AVANCE DE OBRA
router.post('/', authMiddleware, requirePermission('avances', 'create'), async (req, res) => {
  try {
    const { proyectoId, fotos, ...avanceData } = req.body;

    const proyecto = await Proyecto.findById(proyectoId);
    if (!proyecto) return res.status(404).json({ status: 'error', message: 'Proyecto no encontrado' });

    const year = new Date().getFullYear();
    const codigoPart = String(proyecto.codigoInterno).replace(/\s+/g, '').slice(-8).padStart(8, '0');

    // Atomic counter con retry en caso de colisión
    const counterKey = `avance_${proyectoId}`;
    let seq, numeroReporte;

    for (let attempt = 0; attempt < 10; attempt++) {
      await Counter.updateOne({ _id: counterKey }, { $inc: { seq: 1 } }, { upsert: true });
      const counter = await Counter.findById(counterKey);
      seq = counter.seq;

      // Primer uso: seed con el máximo seq existente
      if (seq === 1) {
        const lastAvance = await AvanceObra.findOne({ proyectoId })
          .sort({ numeroReporte: -1 })
          .lean();
        let maxExisting = 0;
        if (lastAvance?.numeroReporte) {
          const match = lastAvance.numeroReporte.match(/-(\d{3})$/);
          if (match) maxExisting = parseInt(match[1], 10);
        }
        if (maxExisting > 0) {
          const adjusted = await Counter.findOneAndUpdate(
            { _id: counterKey, seq: 1 },
            { $set: { seq: maxExisting + 1 } },
            { returnDocument: 'after' }
          );
          if (adjusted) seq = adjusted.seq;
        }
      }

      numeroReporte = `AV-${year}-${codigoPart}-${String(seq).padStart(3, '0')}`;

      // Verificar que no exista ya (safety net por si el counter se desincroniza)
      const exists = await AvanceObra.findOne({ proyectoId, numeroReporte }).lean();
      if (!exists) break;
      // Si ya existe, el loop intenta el siguiente seq automáticamente ($inc ya se ejecutó)
      seq = null;
    }

    if (!seq || !numeroReporte) {
      return res.status(409).json({ status: 'error', message: 'No se pudo generar un número de reporte único. Intente nuevamente.' });
    }

    const codigoVerificacion = crypto
      .createHash('sha256')
      .update(numeroReporte + proyectoId + Date.now().toString())
      .digest('hex')
      .substring(0, 12)
      .toUpperCase();

    const avance = await AvanceObra.create({
      ...avanceData,
      proyectoId,
      numeroReporte,
      codigoVerificacion,
      fotos: fotos || [],
      registradoPor: req.usuario._id,
      estado: 'ENVIADO',
    });

    res.status(201).json({ status: 'success', data: avance });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// AGREGAR FOTO A AVANCE EXISTENTE
// ELIMINAR FOTO DE AVANCE
router.delete('/:id/fotos/:fotoId', authMiddleware, requirePermission('avances', 'update'), async (req, res) => {
  try {
    const avance = await AvanceObra.findById(req.params.id);
    if (!avance) return res.status(404).json({ status: 'error', message: 'Avance no encontrado' });
    if (avance.estado === 'APROBADO') {
      return res.status(400).json({ status: 'error', message: 'No se pueden eliminar fotos de un avance aprobado' });
    }

    const foto = avance.fotos.id(req.params.fotoId);
    if (!foto) return res.status(404).json({ status: 'error', message: 'Foto no encontrada' });

    // Eliminar de Cloudinary
    if (foto.publicId) {
      await cloudinary.uploader.destroy(foto.publicId).catch(() => {});
    }

    foto.deleteOne();
    await avance.save();

    res.json({ status: 'success', data: avance });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// AGREGAR FOTO A AVANCE EXISTENTE
router.put('/:id/fotos', authMiddleware, requirePermission('avances', 'update'), upload.single('foto'), extractExifMiddleware, geoVerificationMiddleware, async (req, res) => {
  try {
    const avance = await AvanceObra.findById(req.params.id);
    if (!avance) return res.status(404).json({ status: 'error', message: 'Avance no encontrado' });
    if (avance.estado === 'APROBADO') {
      return res.status(400).json({ status: 'error', message: 'No se pueden agregar fotos a un avance aprobado' });
    }
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

    avance.fotos.push(fotoData);
    await avance.save();

    res.json({ status: 'success', data: { avance, foto: fotoData } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// ============================================================
// RUTAS CON :id (deben ir AL FINAL)
// ============================================================

// OBTENER AVANCE POR ID
router.get('/:id', authMiddleware, requirePermission('avances', 'read'), async (req, res) => {
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

// ACTUALIZAR AVANCE (solo ENVIADO, o cualquier estado si ADMIN)
router.put('/:id', authMiddleware, requirePermission('avances', 'update'), async (req, res) => {
  try {
    const existing = await AvanceObra.findById(req.params.id);
    if (!existing) return res.status(404).json({ status: 'error', message: 'Avance no encontrado' });
    const esAdmin = req.usuario?.rol === 'ADMIN';
    if (!esAdmin && existing.estado !== 'ENVIADO') {
      return res.status(400).json({ status: 'error', message: 'Solo se puede editar un avance en estado ENVIADO' });
    }
    const avance = await AvanceObra.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ status: 'success', data: avance });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// ELIMINAR AVANCE
router.delete('/:id', authMiddleware, requirePermission('avances', 'delete'), async (req, res) => {
  try {
    const avance = await AvanceObra.findById(req.params.id);
    if (!avance) return res.status(404).json({ status: 'error', message: 'Avance no encontrado' });

    // Eliminar fotos de Cloudinary
    if (avance.fotos?.length > 0) {
      await Promise.allSettled(
        avance.fotos.filter((f) => f.publicId).map((f) => cloudinary.uploader.destroy(f.publicId))
      );
    }

    await AvanceObra.findByIdAndDelete(req.params.id);
    res.json({ status: 'success', message: 'Avance eliminado correctamente' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// APROBAR AVANCE (supervisor)
router.put('/:id/aprobar', authMiddleware, requirePermission('avances', 'aprobar'), async (req, res) => {
  try {
    const avance = await AvanceObra.findById(req.params.id).populate('proyectoId');
    if (!avance) return res.status(404).json({ status: 'error', message: 'Avance no encontrado' });

    avance.estado = 'APROBADO';
    avance.aprobadoPor = req.usuario._id;
    avance.fechaAprobacion = new Date();
    avance.observacionesSupervisor = req.body.observaciones || '';
    await avance.save();

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
router.put('/:id/observar', authMiddleware, requirePermission('avances', 'observar'), async (req, res) => {
  try {
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

module.exports = router;
