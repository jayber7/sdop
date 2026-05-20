const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { unitAccessMiddleware, filterByUnit } = require('../middleware/unitAccessMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const Proyecto = require('../models/Proyecto');
const Empresa = require('../models/Empresa');
const PersonaTecnica = require('../models/PersonaTecnica');
const HitoPresupuestario = require('../models/HitoPresupuestario');
const Desembolso = require('../models/Desembolso');
const RedVial = require('../models/RedVial');
const LicenciaVehiculo = require('../models/LicenciaVehiculo');
const MantenimientoVial = require('../models/MantenimientoVial');
const PlanMaestro = require('../models/PlanMaestro');
const PAC = require('../models/PAC');
const DiagnosticoNecesidades = require('../models/DiagnosticoNecesidades');
const DiagnosticoEnergetico = require('../models/DiagnosticoEnergetico');
const RedElectrica = require('../models/RedElectrica');
const ProyectoEnergiaRenovable = require('../models/ProyectoEnergiaRenovable');
const MapaRiesgo = require('../models/MapaRiesgo');
const PlanContingencia = require('../models/PlanContingencia');
const SistemaAlerta = require('../models/SistemaAlerta');
const RedAguaPotable = require('../models/RedAguaPotable');
const PlantaTratamiento = require('../models/PlantaTratamiento');
const GestionResiduos = require('../models/GestionResiduos');
const PortafolioProyecto = require('../models/PortafolioProyecto');
const ProgramacionEjecucion = require('../models/ProgramacionEjecucion');
const PresupuestoBase = require('../models/PresupuestoBase');
const EficienciaEnergetica = require('../models/EficienciaEnergetica');
const SolicitudFinanciamiento = require('../models/SolicitudFinanciamiento');
const PlanMovilidad = require('../models/PlanMovilidad');
const CapacitacionSimulacro = require('../models/CapacitacionSimulacro');
const PlanCoberturaSaneamiento = require('../models/PlanCoberturaSaneamiento');
const GestionAmbiental = require('../models/GestionAmbiental');

// PROYECTOS
router.get('/proyectos', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { estado, tipo, municipio, unidadResponsable, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (estado) filter.estado = estado;
    if (tipo) filter.tipo = tipo;
    if (municipio) filter.municipio = new RegExp(municipio, 'i');
    if (unidadResponsable && unidadResponsable !== '__NO_ACCESS__') {
      if (typeof unidadResponsable === 'object') {
        filter.unidadResponsable = unidadResponsable;
      } else {
        filter.unidadResponsable = unidadResponsable;
      }
    } else if (unidadResponsable === '__NO_ACCESS__') {
      filter.unidadResponsable = null;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [proyectos, total] = await Promise.all([
      Proyecto.find(filter)
        .populate('empresaId', 'nombre')
        .populate('supervisorId', 'nombreCompleto')
        .populate('inspectorId', 'nombreCompleto')
        .populate('unidadResponsable', 'nombre codigo color')
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

router.get('/proyectos/:id', authMiddleware, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id)
      .populate('empresaId')
      .populate('supervisorId')
      .populate('inspectorId')
      .populate('fiscalId')
      .populate('unidadResponsable');
    if (!proyecto) return res.status(404).json({ status: 'error', message: 'Proyecto no encontrado' });
    res.json({ status: 'success', data: proyecto });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/proyectos', authMiddleware, requirePermission('proyectos', 'create'), async (req, res) => {
  try {
    const proyecto = await Proyecto.create(req.body);
    res.status(201).json({ status: 'success', data: proyecto });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/proyectos/:id', authMiddleware, requirePermission('proyectos', 'update'), async (req, res) => {
  try {
    const proyecto = await Proyecto.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!proyecto) return res.status(404).json({ status: 'error', message: 'Proyecto no encontrado' });
    res.json({ status: 'success', data: proyecto });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/proyectos/:id', authMiddleware, requirePermission('proyectos', 'delete'), async (req, res) => {
  try {
    const proyecto = await Proyecto.findByIdAndDelete(req.params.id);
    if (!proyecto) return res.status(404).json({ status: 'error', message: 'Proyecto no encontrado' });
    res.json({ status: 'success', message: 'Proyecto eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// EMPRESAS
router.get('/empresas', authMiddleware, requirePermission('empresas', 'read'), async (req, res) => {
  try {
    const empresas = await Empresa.find({ habilitado: true }).sort({ nombre: 1 });
    res.json({ status: 'success', data: empresas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/empresas', authMiddleware, requirePermission('empresas', 'create'), async (req, res) => {
  try {
    const empresa = await Empresa.create(req.body);
    res.status(201).json({ status: 'success', data: empresa });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/empresas/:id', authMiddleware, requirePermission('empresas', 'update'), async (req, res) => {
  try {
    const empresa = await Empresa.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!empresa) return res.status(404).json({ status: 'error', message: 'Empresa no encontrada' });
    res.json({ status: 'success', data: empresa });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/empresas/:id', authMiddleware, requirePermission('empresas', 'delete'), async (req, res) => {
  try {
    const empresa = await Empresa.findByIdAndDelete(req.params.id);
    if (!empresa) return res.status(404).json({ status: 'error', message: 'Empresa no encontrada' });
    res.json({ status: 'success', message: 'Empresa eliminada' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PERSONAS TECNICAS
router.get('/personas-tecnicas', authMiddleware, requirePermission('personasTecnicas', 'read'), async (req, res) => {
  try {
    const { rol, unidadAsignada } = req.query;
    const filter = { habilitado: true };
    if (rol) filter.rol = rol;
    if (unidadAsignada) filter.unidadAsignada = unidadAsignada;
    const personas = await PersonaTecnica.find(filter).populate('unidadAsignada', 'nombre codigo').sort({ nombreCompleto: 1 });
    res.json({ status: 'success', data: personas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/personas-tecnicas', authMiddleware, requirePermission('personasTecnicas', 'create'), async (req, res) => {
  try {
    const persona = await PersonaTecnica.create(req.body);
    res.status(201).json({ status: 'success', data: persona });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/personas-tecnicas/:id', authMiddleware, requirePermission('personasTecnicas', 'update'), async (req, res) => {
  try {
    const persona = await PersonaTecnica.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!persona) return res.status(404).json({ status: 'error', message: 'Persona no encontrada' });
    res.json({ status: 'success', data: persona });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/personas-tecnicas/:id', authMiddleware, requirePermission('personasTecnicas', 'delete'), async (req, res) => {
  try {
    const persona = await PersonaTecnica.findByIdAndDelete(req.params.id);
    if (!persona) return res.status(404).json({ status: 'error', message: 'Persona no encontrada' });
    res.json({ status: 'success', message: 'Persona técnica eliminada' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// HITOS PRESUPUESTARIOS
router.get('/hitos', authMiddleware, requirePermission('hitos', 'read'), async (req, res) => {
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

router.post('/hitos', authMiddleware, requirePermission('hitos', 'create'), async (req, res) => {
  try {
    const hito = await HitoPresupuestario.create(req.body);
    res.status(201).json({ status: 'success', data: hito });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/hitos/:id', authMiddleware, requirePermission('hitos', 'update'), async (req, res) => {
  try {
    const hito = await HitoPresupuestario.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!hito) return res.status(404).json({ status: 'error', message: 'Hito no encontrado' });
    res.json({ status: 'success', data: hito });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/hitos/:id', authMiddleware, requirePermission('hitos', 'delete'), async (req, res) => {
  try {
    const hito = await HitoPresupuestario.findByIdAndDelete(req.params.id);
    if (!hito) return res.status(404).json({ status: 'error', message: 'Hito no encontrado' });
    res.json({ status: 'success', message: 'Hito eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DESEMBOLSOS
router.get('/desembolsos', authMiddleware, requirePermission('desembolsos', 'read'), async (req, res) => {
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

router.post('/desembolsos', authMiddleware, requirePermission('desembolsos', 'create'), async (req, res) => {
  try {
    const desembolso = await Desembolso.create({ ...req.body, fechaSolicitud: new Date() });
    res.status(201).json({ status: 'success', data: desembolso });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/desembolsos/:id', authMiddleware, requirePermission('desembolsos', 'update'), async (req, res) => {
  try {
    const desembolso = await Desembolso.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!desembolso) return res.status(404).json({ status: 'error', message: 'Desembolso no encontrado' });
    res.json({ status: 'success', data: desembolso });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// RED VIAL (JT)
router.get('/red-vial', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { tipo, estado, municipio, unidadResponsable } = req.query;
    const filter = {};
    if (tipo) filter.tipo = tipo;
    if (estado) filter.estado = estado;
    if (municipio) filter.municipio = new RegExp(municipio, 'i');
    if (unidadResponsable && typeof unidadResponsable === 'string' && unidadResponsable !== '__NO_ACCESS__') {
      filter.unidadResponsable = unidadResponsable;
    }
    const redVial = await RedVial.find(filter).populate('unidadResponsable', 'nombre codigo color').sort({ codigo: 1 });
    res.json({ status: 'success', data: redVial });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/red-vial', authMiddleware, async (req, res) => {
  try {
    const item = await RedVial.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/red-vial/:id', authMiddleware, async (req, res) => {
  try {
    const item = await RedVial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/red-vial/:id', authMiddleware, async (req, res) => {
  try {
    const item = await RedVial.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// LICENCIAS VEHICULO (JT)
router.get('/licencias-vehiculo', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { tipoVehiculo, estado, municipio } = req.query;
    const filter = {};
    if (tipoVehiculo) filter.tipoVehiculo = tipoVehiculo;
    if (estado) filter.estado = estado;
    if (municipio) filter.municipio = new RegExp(municipio, 'i');
    const licencias = await LicenciaVehiculo.find(filter).populate('unidadResponsable', 'nombre codigo').sort({ placa: 1 });
    res.json({ status: 'success', data: licencias });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/licencias-vehiculo', authMiddleware, async (req, res) => {
  try {
    const item = await LicenciaVehiculo.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/licencias-vehiculo/:id', authMiddleware, async (req, res) => {
  try {
    const item = await LicenciaVehiculo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/licencias-vehiculo/:id', authMiddleware, async (req, res) => {
  try {
    const item = await LicenciaVehiculo.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// MANTENIMIENTO VIAL (JT)
router.get('/mantenimiento-vial', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { tipo, estado, redVialId } = req.query;
    const filter = {};
    if (tipo) filter.tipo = tipo;
    if (estado) filter.estado = estado;
    if (redVialId) filter.redVialId = redVialId;
    const mantenimientos = await MantenimientoVial.find(filter)
      .populate('redVialId', 'nombre codigo')
      .populate('empresaId', 'nombre')
      .populate('unidadResponsable', 'nombre codigo')
      .sort({ fechaInicio: -1 });
    res.json({ status: 'success', data: mantenimientos });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/mantenimiento-vial', authMiddleware, async (req, res) => {
  try {
    const item = await MantenimientoVial.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/mantenimiento-vial/:id', authMiddleware, async (req, res) => {
  try {
    const item = await MantenimientoVial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/mantenimiento-vial/:id', authMiddleware, async (req, res) => {
  try {
    const item = await MantenimientoVial.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PLAN MAESTRO (DI)
router.get('/plan-maestro', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { estado } = req.query;
    const filter = {};
    if (estado) filter.estado = estado;
    const planes = await PlanMaestro.find(filter).populate('unidadResponsable', 'nombre codigo').sort({ periodo: -1 });
    res.json({ status: 'success', data: planes });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/plan-maestro', authMiddleware, async (req, res) => {
  try {
    const item = await PlanMaestro.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/plan-maestro/:id', authMiddleware, async (req, res) => {
  try {
    const item = await PlanMaestro.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/plan-maestro/:id', authMiddleware, async (req, res) => {
  try {
    const item = await PlanMaestro.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PAC (DI)
router.get('/pac', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { gestion, estado } = req.query;
    const filter = {};
    if (gestion) filter.gestion = parseInt(gestion);
    if (estado) filter.estado = estado;
    const pacs = await PAC.find(filter).populate('unidadResponsable', 'nombre codigo').sort({ gestion: -1 });
    res.json({ status: 'success', data: pacs });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/pac', authMiddleware, async (req, res) => {
  try {
    const item = await PAC.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/pac/:id', authMiddleware, async (req, res) => {
  try {
    const item = await PAC.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/pac/:id', authMiddleware, async (req, res) => {
  try {
    const item = await PAC.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DIAGNOSTICO NECESIDADES (DI)
router.get('/diagnosticos-necesidades', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { sector, estado, municipio } = req.query;
    const filter = {};
    if (sector) filter.sector = sector;
    if (estado) filter.estado = estado;
    if (municipio) filter.municipio = new RegExp(municipio, 'i');
    const diagnosticos = await DiagnosticoNecesidades.find(filter).populate('unidadResponsable', 'nombre codigo').sort({ fechaElaboracion: -1 });
    res.json({ status: 'success', data: diagnosticos });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/diagnosticos-necesidades', authMiddleware, async (req, res) => {
  try {
    const item = await DiagnosticoNecesidades.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/diagnosticos-necesidades/:id', authMiddleware, async (req, res) => {
  try {
    const item = await DiagnosticoNecesidades.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/diagnosticos-necesidades/:id', authMiddleware, async (req, res) => {
  try {
    const item = await DiagnosticoNecesidades.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DIAGNOSTICO ENERGETICO (JE)
router.get('/diagnosticos-energeticos', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { estado, municipio } = req.query;
    const filter = {};
    if (estado) filter.estado = estado;
    if (municipio) filter.municipio = new RegExp(municipio, 'i');
    const diagnosticos = await DiagnosticoEnergetico.find(filter).populate('unidadResponsable', 'nombre codigo').sort({ fechaElaboracion: -1 });
    res.json({ status: 'success', data: diagnosticos });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/diagnosticos-energeticos', authMiddleware, async (req, res) => {
  try {
    const item = await DiagnosticoEnergetico.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/diagnosticos-energeticos/:id', authMiddleware, async (req, res) => {
  try {
    const item = await DiagnosticoEnergetico.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/diagnosticos-energeticos/:id', authMiddleware, async (req, res) => {
  try {
    const item = await DiagnosticoEnergetico.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// RED ELECTRICA (JE)
router.get('/red-electrica', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { tipo, estado, municipio } = req.query;
    const filter = {};
    if (tipo) filter.tipo = tipo;
    if (estado) filter.estado = estado;
    if (municipio) filter.municipio = new RegExp(municipio, 'i');
    const redes = await RedElectrica.find(filter).populate('unidadResponsable', 'nombre codigo').sort({ codigo: 1 });
    res.json({ status: 'success', data: redes });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/red-electrica', authMiddleware, async (req, res) => {
  try {
    const item = await RedElectrica.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/red-electrica/:id', authMiddleware, async (req, res) => {
  try {
    const item = await RedElectrica.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/red-electrica/:id', authMiddleware, async (req, res) => {
  try {
    const item = await RedElectrica.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PROYECTO ENERGIA RENOVABLE (JE)
router.get('/proyectos-energia-renovable', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { tipo, estado, municipio } = req.query;
    const filter = {};
    if (tipo) filter.tipo = tipo;
    if (estado) filter.estado = estado;
    if (municipio) filter.municipio = new RegExp(municipio, 'i');
    const proyectos = await ProyectoEnergiaRenovable.find(filter).populate('unidadResponsable', 'nombre codigo').sort({ createdAt: -1 });
    res.json({ status: 'success', data: proyectos });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/proyectos-energia-renovable', authMiddleware, async (req, res) => {
  try {
    const item = await ProyectoEnergiaRenovable.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/proyectos-energia-renovable/:id', authMiddleware, async (req, res) => {
  try {
    const item = await ProyectoEnergiaRenovable.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/proyectos-energia-renovable/:id', authMiddleware, async (req, res) => {
  try {
    const item = await ProyectoEnergiaRenovable.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// MAPA RIESGO (JUPRE)
router.get('/mapas-riesgo', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { tipo, nivelRiesgo, estado, municipio } = req.query;
    const filter = {};
    if (tipo) filter.tipo = tipo;
    if (nivelRiesgo) filter.nivelRiesgo = nivelRiesgo;
    if (estado) filter.estado = estado;
    if (municipio) filter.municipio = new RegExp(municipio, 'i');
    const mapas = await MapaRiesgo.find(filter).populate('unidadResponsable', 'nombre codigo').sort({ fechaElaboracion: -1 });
    res.json({ status: 'success', data: mapas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/mapas-riesgo', authMiddleware, async (req, res) => {
  try {
    const item = await MapaRiesgo.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/mapas-riesgo/:id', authMiddleware, async (req, res) => {
  try {
    const item = await MapaRiesgo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/mapas-riesgo/:id', authMiddleware, async (req, res) => {
  try {
    const item = await MapaRiesgo.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PLAN CONTINGENCIA (JUPRE)
router.get('/planes-contingencia', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { tipoEmergencia, estado, municipio } = req.query;
    const filter = {};
    if (tipoEmergencia) filter.tipoEmergencia = tipoEmergencia;
    if (estado) filter.estado = estado;
    if (municipio) filter.municipio = new RegExp(municipio, 'i');
    const planes = await PlanContingencia.find(filter).populate('unidadResponsable', 'nombre codigo').sort({ fechaElaboracion: -1 });
    res.json({ status: 'success', data: planes });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/planes-contingencia', authMiddleware, async (req, res) => {
  try {
    const item = await PlanContingencia.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/planes-contingencia/:id', authMiddleware, async (req, res) => {
  try {
    const item = await PlanContingencia.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/planes-contingencia/:id', authMiddleware, async (req, res) => {
  try {
    const item = await PlanContingencia.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// SISTEMA ALERTA (JUPRE)
router.get('/sistemas-alerta', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { tipo, estado, municipio } = req.query;
    const filter = {};
    if (tipo) filter.tipo = tipo;
    if (estado) filter.estado = estado;
    if (municipio) filter.municipio = new RegExp(municipio, 'i');
    const sistemas = await SistemaAlerta.find(filter).populate('unidadResponsable', 'nombre codigo').sort({ nombre: 1 });
    res.json({ status: 'success', data: sistemas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/sistemas-alerta', authMiddleware, async (req, res) => {
  try {
    const item = await SistemaAlerta.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/sistemas-alerta/:id', authMiddleware, async (req, res) => {
  try {
    const item = await SistemaAlerta.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/sistemas-alerta/:id', authMiddleware, async (req, res) => {
  try {
    const item = await SistemaAlerta.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// RED AGUA POTABLE (JUS)
router.get('/red-agua-potable', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { tipo, estado, municipio } = req.query;
    const filter = {};
    if (tipo) filter.tipo = tipo;
    if (estado) filter.estado = estado;
    if (municipio) filter.municipio = new RegExp(municipio, 'i');
    const redes = await RedAguaPotable.find(filter).populate('unidadResponsable', 'nombre codigo').sort({ codigo: 1 });
    res.json({ status: 'success', data: redes });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/red-agua-potable', authMiddleware, async (req, res) => {
  try {
    const item = await RedAguaPotable.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/red-agua-potable/:id', authMiddleware, async (req, res) => {
  try {
    const item = await RedAguaPotable.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/red-agua-potable/:id', authMiddleware, async (req, res) => {
  try {
    const item = await RedAguaPotable.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PLANTA TRATAMIENTO (JUS)
router.get('/plantas-tratamiento', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { tipo, estado, municipio } = req.query;
    const filter = {};
    if (tipo) filter.tipo = tipo;
    if (estado) filter.estado = estado;
    if (municipio) filter.municipio = new RegExp(municipio, 'i');
    const plantas = await PlantaTratamiento.find(filter).populate('unidadResponsable', 'nombre codigo').sort({ nombre: 1 });
    res.json({ status: 'success', data: plantas });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/plantas-tratamiento', authMiddleware, async (req, res) => {
  try {
    const item = await PlantaTratamiento.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/plantas-tratamiento/:id', authMiddleware, async (req, res) => {
  try {
    const item = await PlantaTratamiento.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/plantas-tratamiento/:id', authMiddleware, async (req, res) => {
  try {
    const item = await PlantaTratamiento.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GESTION RESIDUOS (JUS)
router.get('/gestion-residuos', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { tipo, estado, municipio } = req.query;
    const filter = {};
    if (tipo) filter.tipo = tipo;
    if (estado) filter.estado = estado;
    if (municipio) filter.municipio = new RegExp(municipio, 'i');
    const gestiones = await GestionResiduos.find(filter).populate('unidadResponsable', 'nombre codigo').sort({ nombre: 1 });
    res.json({ status: 'success', data: gestiones });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/gestion-residuos', authMiddleware, async (req, res) => {
  try {
    const item = await GestionResiduos.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.put('/gestion-residuos/:id', authMiddleware, async (req, res) => {
  try {
    const item = await GestionResiduos.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.delete('/gestion-residuos/:id', authMiddleware, async (req, res) => {
  try {
    const item = await GestionResiduos.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============================================================
// NUEVOS MODELOS - DI (Dirección de Infraestructura)
// ============================================================

// PORTAFOLIO PROYECTO (DI)
router.get('/portafolio-proyectos', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { tipo, estado, municipio, unidadResponsable } = req.query;
    const filter = {};
    if (tipo) filter.tipo = tipo;
    if (estado) filter.estado = estado;
    if (municipio) filter.municipio = new RegExp(municipio, 'i');
    if (unidadResponsable && typeof unidadResponsable === 'string' && unidadResponsable !== '__NO_ACCESS__') filter.unidadResponsable = unidadResponsable;
    const items = await PortafolioProyecto.find(filter).populate('unidadResponsable', 'nombre codigo color').populate('responsable', 'nombreCompleto').sort({ createdAt: -1 });
    res.json({ status: 'success', data: items });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
router.post('/portafolio-proyectos', authMiddleware, requirePermission('proyectos', 'create'), async (req, res) => {
  try {
    const item = await PortafolioProyecto.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});
router.put('/portafolio-proyectos/:id', authMiddleware, requirePermission('proyectos', 'update'), async (req, res) => {
  try {
    const item = await PortafolioProyecto.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});
router.delete('/portafolio-proyectos/:id', authMiddleware, requirePermission('proyectos', 'delete'), async (req, res) => {
  try {
    const item = await PortafolioProyecto.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PROGRAMACION EJECUCION (DI)
router.get('/programaciones-ejecucion', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { gestion, trimestre, estado, unidadResponsable } = req.query;
    const filter = {};
    if (gestion) filter.gestion = parseInt(gestion);
    if (trimestre) filter.trimestre = parseInt(trimestre);
    if (estado) filter.estado = estado;
    if (unidadResponsable && typeof unidadResponsable === 'string' && unidadResponsable !== '__NO_ACCESS__') filter.unidadResponsable = unidadResponsable;
    const items = await ProgramacionEjecucion.find(filter).populate('unidadResponsable', 'nombre codigo color').populate('responsable', 'nombreCompleto').sort({ gestion: -1, trimestre: 1 });
    res.json({ status: 'success', data: items });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
router.post('/programaciones-ejecucion', authMiddleware, requirePermission('proyectos', 'create'), async (req, res) => {
  try {
    const item = await ProgramacionEjecucion.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});
router.put('/programaciones-ejecucion/:id', authMiddleware, requirePermission('proyectos', 'update'), async (req, res) => {
  try {
    const item = await ProgramacionEjecucion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});
router.delete('/programaciones-ejecucion/:id', authMiddleware, requirePermission('proyectos', 'delete'), async (req, res) => {
  try {
    const item = await ProgramacionEjecucion.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PRESUPUESTO BASE (DI)
router.get('/presupuestos-base', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { gestion, tipoPresupuesto, estado, unidadResponsable } = req.query;
    const filter = {};
    if (gestion) filter.gestion = parseInt(gestion);
    if (tipoPresupuesto) filter.tipoPresupuesto = tipoPresupuesto;
    if (estado) filter.estado = estado;
    if (unidadResponsable && typeof unidadResponsable === 'string' && unidadResponsable !== '__NO_ACCESS__') filter.unidadResponsable = unidadResponsable;
    const items = await PresupuestoBase.find(filter).populate('unidadResponsable', 'nombre codigo color').populate('responsable', 'nombreCompleto').sort({ gestion: -1 });
    res.json({ status: 'success', data: items });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
router.post('/presupuestos-base', authMiddleware, requirePermission('proyectos', 'create'), async (req, res) => {
  try {
    const item = await PresupuestoBase.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});
router.put('/presupuestos-base/:id', authMiddleware, requirePermission('proyectos', 'update'), async (req, res) => {
  try {
    const item = await PresupuestoBase.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});
router.delete('/presupuestos-base/:id', authMiddleware, requirePermission('proyectos', 'delete'), async (req, res) => {
  try {
    const item = await PresupuestoBase.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============================================================
// NUEVOS MODELOS - JE (Jefatura de Energía)
// ============================================================

// EFICIENCIA ENERGETICA (JE)
router.get('/eficiencias-energeticas', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { estado, municipio, tipoEdificio, unidadResponsable } = req.query;
    const filter = {};
    if (estado) filter.estado = estado;
    if (municipio) filter.municipio = new RegExp(municipio, 'i');
    if (tipoEdificio) filter.tipoEdificio = tipoEdificio;
    if (unidadResponsable && typeof unidadResponsable === 'string' && unidadResponsable !== '__NO_ACCESS__') filter.unidadResponsable = unidadResponsable;
    const items = await EficienciaEnergetica.find(filter).populate('unidadResponsable', 'nombre codigo color').populate('responsable', 'nombreCompleto').sort({ createdAt: -1 });
    res.json({ status: 'success', data: items });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
router.post('/eficiencias-energeticas', authMiddleware, requirePermission('proyectos', 'create'), async (req, res) => {
  try {
    const item = await EficienciaEnergetica.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});
router.put('/eficiencias-energeticas/:id', authMiddleware, requirePermission('proyectos', 'update'), async (req, res) => {
  try {
    const item = await EficienciaEnergetica.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});
router.delete('/eficiencias-energeticas/:id', authMiddleware, requirePermission('proyectos', 'delete'), async (req, res) => {
  try {
    const item = await EficienciaEnergetica.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// SOLICITUD FINANCIAMIENTO (JE)
router.get('/solicitudes-financiamiento', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { entidadFinanciera, estado, tipoFinanciamiento, unidadResponsable } = req.query;
    const filter = {};
    if (entidadFinanciera) filter.entidadFinanciera = entidadFinanciera;
    if (estado) filter.estado = estado;
    if (tipoFinanciamiento) filter.tipoFinanciamiento = tipoFinanciamiento;
    if (unidadResponsable && typeof unidadResponsable === 'string' && unidadResponsable !== '__NO_ACCESS__') filter.unidadResponsable = unidadResponsable;
    const items = await SolicitudFinanciamiento.find(filter).populate('unidadResponsable', 'nombre codigo color').populate('proyectoRelacionado', 'nombre').populate('responsable', 'nombreCompleto').sort({ createdAt: -1 });
    res.json({ status: 'success', data: items });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
router.post('/solicitudes-financiamiento', authMiddleware, requirePermission('proyectos', 'create'), async (req, res) => {
  try {
    const item = await SolicitudFinanciamiento.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});
router.put('/solicitudes-financiamiento/:id', authMiddleware, requirePermission('proyectos', 'update'), async (req, res) => {
  try {
    const item = await SolicitudFinanciamiento.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});
router.delete('/solicitudes-financiamiento/:id', authMiddleware, requirePermission('proyectos', 'delete'), async (req, res) => {
  try {
    const item = await SolicitudFinanciamiento.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============================================================
// NUEVOS MODELOS - JT (Jefatura de Transporte)
// ============================================================

// PLAN MOVILIDAD (JT)
router.get('/planes-movilidad', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { ambito, estado, municipio, unidadResponsable } = req.query;
    const filter = {};
    if (ambito) filter.ambito = ambito;
    if (estado) filter.estado = estado;
    if (municipio) filter.municipio = new RegExp(municipio, 'i');
    if (unidadResponsable && typeof unidadResponsable === 'string' && unidadResponsable !== '__NO_ACCESS__') filter.unidadResponsable = unidadResponsable;
    const items = await PlanMovilidad.find(filter).populate('unidadResponsable', 'nombre codigo color').populate('responsable', 'nombreCompleto').sort({ createdAt: -1 });
    res.json({ status: 'success', data: items });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
router.post('/planes-movilidad', authMiddleware, requirePermission('proyectos', 'create'), async (req, res) => {
  try {
    const item = await PlanMovilidad.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});
router.put('/planes-movilidad/:id', authMiddleware, requirePermission('proyectos', 'update'), async (req, res) => {
  try {
    const item = await PlanMovilidad.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});
router.delete('/planes-movilidad/:id', authMiddleware, requirePermission('proyectos', 'delete'), async (req, res) => {
  try {
    const item = await PlanMovilidad.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============================================================
// NUEVOS MODELOS - JUPRE (Prevención Riesgos y Emergencias)
// ============================================================

// CAPACITACION SIMULACRO (JUPRE)
router.get('/capacitaciones-simulacros', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { tipo, estado, municipio, unidadResponsable } = req.query;
    const filter = {};
    if (tipo) filter.tipo = tipo;
    if (estado) filter.estado = estado;
    if (municipio) filter.municipio = new RegExp(municipio, 'i');
    if (unidadResponsable && typeof unidadResponsable === 'string' && unidadResponsable !== '__NO_ACCESS__') filter.unidadResponsable = unidadResponsable;
    const items = await CapacitacionSimulacro.find(filter).populate('unidadResponsable', 'nombre codigo color').populate('responsable', 'nombreCompleto').sort({ fechaProgramada: -1 });
    res.json({ status: 'success', data: items });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
router.post('/capacitaciones-simulacros', authMiddleware, requirePermission('proyectos', 'create'), async (req, res) => {
  try {
    const item = await CapacitacionSimulacro.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});
router.put('/capacitaciones-simulacros/:id', authMiddleware, requirePermission('proyectos', 'update'), async (req, res) => {
  try {
    const item = await CapacitacionSimulacro.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});
router.delete('/capacitaciones-simulacros/:id', authMiddleware, requirePermission('proyectos', 'delete'), async (req, res) => {
  try {
    const item = await CapacitacionSimulacro.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ============================================================
// NUEVOS MODELOS - JUS (Saneamiento)
// ============================================================

// PLAN COBERTURA SANEAMIENTO (JUS)
router.get('/planes-cobertura-saneamiento', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { tipoSaneamiento, estado, municipio, unidadResponsable } = req.query;
    const filter = {};
    if (tipoSaneamiento) filter.tipoSaneamiento = tipoSaneamiento;
    if (estado) filter.estado = estado;
    if (municipio) filter.municipio = new RegExp(municipio, 'i');
    if (unidadResponsable && typeof unidadResponsable === 'string' && unidadResponsable !== '__NO_ACCESS__') filter.unidadResponsable = unidadResponsable;
    const items = await PlanCoberturaSaneamiento.find(filter).populate('unidadResponsable', 'nombre codigo color').populate('responsable', 'nombreCompleto').sort({ createdAt: -1 });
    res.json({ status: 'success', data: items });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
router.post('/planes-cobertura-saneamiento', authMiddleware, requirePermission('proyectos', 'create'), async (req, res) => {
  try {
    const item = await PlanCoberturaSaneamiento.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});
router.put('/planes-cobertura-saneamiento/:id', authMiddleware, requirePermission('proyectos', 'update'), async (req, res) => {
  try {
    const item = await PlanCoberturaSaneamiento.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});
router.delete('/planes-cobertura-saneamiento/:id', authMiddleware, requirePermission('proyectos', 'delete'), async (req, res) => {
  try {
    const item = await PlanCoberturaSaneamiento.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GESTION AMBIENTAL (JUS)
router.get('/gestiones-ambientales', authMiddleware, unitAccessMiddleware, filterByUnit, requirePermission('proyectos', 'read'), async (req, res) => {
  try {
    const { tipoEvaluacion, estado, componente, nivelImpacto, municipio, unidadResponsable } = req.query;
    const filter = {};
    if (tipoEvaluacion) filter.tipoEvaluacion = tipoEvaluacion;
    if (estado) filter.estado = estado;
    if (componente) filter.componente = componente;
    if (nivelImpacto) filter.nivelImpacto = nivelImpacto;
    if (municipio) filter.municipio = new RegExp(municipio, 'i');
    if (unidadResponsable && typeof unidadResponsable === 'string' && unidadResponsable !== '__NO_ACCESS__') filter.unidadResponsable = unidadResponsable;
    const items = await GestionAmbiental.find(filter).populate('unidadResponsable', 'nombre codigo color').populate('proyectoRelacionado', 'nombre').populate('responsable', 'nombreCompleto').sort({ fechaEvaluacion: -1 });
    res.json({ status: 'success', data: items });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
router.post('/gestiones-ambientales', authMiddleware, requirePermission('proyectos', 'create'), async (req, res) => {
  try {
    const item = await GestionAmbiental.create(req.body);
    res.status(201).json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});
router.put('/gestiones-ambientales/:id', authMiddleware, requirePermission('proyectos', 'update'), async (req, res) => {
  try {
    const item = await GestionAmbiental.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', data: item });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});
router.delete('/gestiones-ambientales/:id', authMiddleware, requirePermission('proyectos', 'delete'), async (req, res) => {
  try {
    const item = await GestionAmbiental.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
    res.json({ status: 'success', message: 'Registro eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
