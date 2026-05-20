/**
 * Script para sembrar datos en la base de datos SDOP
 * Basado en información extraída de:
 * - INFORME-TECNICO-SDPD-No-038-2026_0001COMPRESO-1.pdf
 * - RENDICION_INICIAL_2025_30_ABRIL_2025.pdf
 */

require('dotenv').config();
const mongoose = require('mongoose');
const UnidadOrganizativa = require('./models/UnidadOrganizativa');
const Usuario = require('./models/Usuario');
const Proyecto = require('./models/Proyecto');
const Empresa = require('./models/Empresa');
const PersonaTecnica = require('./models/PersonaTecnica');
const HitoPresupuestario = require('./models/HitoPresupuestario');
const Feedback = require('./models/Feedback');
const PortafolioProyecto = require('./models/PortafolioProyecto');
const ProgramacionEjecucion = require('./models/ProgramacionEjecucion');
const PresupuestoBase = require('./models/PresupuestoBase');
const EficienciaEnergetica = require('./models/EficienciaEnergetica');
const SolicitudFinanciamiento = require('./models/SolicitudFinanciamiento');
const PlanMovilidad = require('./models/PlanMovilidad');
const CapacitacionSimulacro = require('./models/CapacitacionSimulacro');
const PlanCoberturaSaneamiento = require('./models/PlanCoberturaSaneamiento');
const GestionAmbiental = require('./models/GestionAmbiental');

const unidades = [
  {
    nombre: 'Dirección de Infraestructura',
    codigo: 'DI',
    descripcion: 'Planes maestros de obras públicas, portafolio de proyectos, PAC, presupuesto',
    color: '#1565c0',
    icono: 'Engineering',
    planEstrategico: {
      objetivos: ['Gestión de proyectos y presupuesto'],
      programas: ['Planes Maestros', 'Diagnóstico de Necesidades', 'PAC'],
    },
  },
  {
    nombre: 'Jefatura de Energía',
    codigo: 'JE',
    descripcion: 'Diagnóstico energético, expansión de redes, proyectos de energías renovables',
    color: '#2e7d32',
    icono: 'ElectricBolt',
    planEstrategico: {
      objetivos: ['Gestión de recursos energéticos y proyectos'],
      programas: ['Electrificación Rural', 'Energías Renovables'],
    },
  },
  {
    nombre: 'Jefatura de Transporte',
    codigo: 'JT',
    descripcion: 'Plan integral de movilidad, inventario de red vial, mantenimiento vial',
    color: '#e65100',
    icono: 'Road',
    planEstrategico: {
      objetivos: ['Movilidad y infraestructura vial'],
      programas: ['Plan de Movilidad', 'Mantenimiento Vial', 'Licencias'],
    },
  },
  {
    nombre: 'Jefatura de Unidad de Prevención Riesgos y Emergencias',
    codigo: 'JUPRE',
    descripcion: 'Mapas de riesgos, planes de contingencia, sistemas de alerta temprana',
    color: '#6a1b9a',
    icono: 'Warning',
    planEstrategico: {
      objetivos: ['Prevención y respuesta ante riesgos'],
      programas: ['Mapas de Riesgo', 'Planes de Contingencia', 'Alerta Temprana'],
    },
  },
  {
    nombre: 'Jefatura de Unidad de Saneamiento',
    codigo: 'JUS',
    descripcion: 'Diagnóstico de agua potable, redes de saneamiento, gestión de residuos',
    color: '#c62828',
    icono: 'WaterDrop',
    planEstrategico: {
      objetivos: ['Agua potable y gestión de residuos'],
      programas: ['Redes de Agua', 'Plantas de Tratamiento', 'GIRS'],
    },
  },
];

const tipoToUnidad = {
  CAMINO: 'JT',
  PUENTE: 'JT',
  ELECTRIFICACION: 'JE',
  AGUA_POTABLE: 'JUS',
  SANEAMIENTO: 'JUS',
  EDIFICACION: 'DI',
  OTRO: 'DI',
};

// Datos de empresas constructoras (extraídas/inferidas de los informes)
const empresas = [
  {
    nombre: 'CONSTRUCTORA ANDINA S.A.',
    nit: '1004567890123',
    representanteLegal: 'Carlos Mamani Quispe',
    especialidades: ['CAMINOS', 'PUENTES'],
    categoria: 'GRANDE',
    registroSICOPI: 'SICOPI-2023-001',
    direccion: 'Av. Cívica #456, Oruro',
    telefono: '591-2-5256789',
    email: 'info@constructoraandina.bo',
  },
  {
    nombre: 'ELECTRO SERVICIOS ORURO S.R.L.',
    nit: '1005678901234',
    representanteLegal: 'María Condori Flores',
    especialidades: ['ELECTRIFICACION'],
    categoria: 'MEDIANA',
    registroSICOPI: 'SICOPI-2023-045',
    direccion: 'Calle Bolívar #234, Oruro',
    telefono: '591-2-5267890',
    email: 'contacto@electroservicios.bo',
  },
  {
    nombre: 'AGUA Y SANEAMIENTO BOLIVIA S.A.',
    nit: '1006789012345',
    representanteLegal: 'Juan Choque Mamani',
    especialidades: ['AGUA_POTABLE', 'SANEAMIENTO'],
    categoria: 'GRANDE',
    registroSICOPI: 'SICOPI-2022-078',
    direccion: 'Av. 6 de Agosto #789, Oruro',
    telefono: '591-2-5278901',
    email: 'info@aguaySaneamiento.bo',
  },
  {
    nombre: 'CONSTRUCTORA ALTIPLANO S.R.L.',
    nit: '1007890123456',
    representanteLegal: 'Roberto Huanca Condori',
    especialidades: ['EDIFICACION', 'GENERAL'],
    categoria: 'MEDIANA',
    registroSICOPI: 'SICOPI-2024-012',
    direccion: 'Calle Sucre #123, Oruro',
    telefono: '591-2-5289012',
    email: 'admin@constructoraaltiplano.bo',
  },
  {
    nombre: 'INGENIERIA Y CAMINOS DEL SUR S.A.',
    nit: '1008901234567',
    representanteLegal: 'Patricia Vargas Rojas',
    especialidades: ['CAMINOS', 'PUENTES', 'SANEAMIENTO'],
    categoria: 'GRANDE',
    registroSICOPI: 'SICOPI-2021-089',
    direccion: 'Av. Panamericana #567, Oruro',
    telefono: '591-2-5290123',
    email: 'proyectos@camino sdelsur.bo',
  },
];

// Datos de personas técnicas (supervisores, inspectores, fiscales)
const personasTecnicas = [
  {
    nombreCompleto: 'Ing. Fernando Torrez Mamani',
    ci: '8765432',
    profesion: 'Ingeniería Civil',
    matriculaProfesional: 'CIV-12345',
    especialidad: 'CAMINOS',
    experienciaAnios: 12,
    rol: 'SUPERVISOR',
    telefono: '591-71234567',
    email: 'ftorrez@sdop.bo',
  },
  {
    nombreCompleto: 'Ing. Ana Quispe Condori',
    ci: '9876543',
    profesion: 'Ingeniería Eléctrica',
    matriculaProfesional: 'ELE-23456',
    especialidad: 'ELECTRIFICACION',
    experienciaAnios: 8,
    rol: 'SUPERVISOR',
    telefono: '591-72345678',
    email: 'aquispe@sdop.bo',
  },
  {
    nombreCompleto: 'Ing. Pedro Huanca Flores',
    ci: '7654321',
    profesion: 'Ingeniería Sanitaria',
    matriculaProfesional: 'SAN-34567',
    especialidad: 'SANEAMIENTO',
    experienciaAnios: 15,
    rol: 'INSPECTOR',
    telefono: '591-73456789',
    email: 'phuanca@sdop.bo',
  },
  {
    nombreCompleto: 'Arq. Lucia Rojas Mamani',
    ci: '6543210',
    profesion: 'Arquitectura',
    matriculaProfesional: 'ARQ-45678',
    especialidad: 'GENERAL',
    experienciaAnios: 10,
    rol: 'INSPECTOR',
    telefono: '591-74567890',
    email: 'lrojas@sdop.bo',
  },
  {
    nombreCompleto: 'Ing. Diego Condori Vargas',
    ci: '5432109',
    profesion: 'Ingeniería Civil',
    matriculaProfesional: 'CIV-56789',
    especialidad: 'PUENTES',
    experienciaAnios: 18,
    rol: 'FISCAL',
    telefono: '591-75678901',
    email: 'dcondori@sdop.bo',
  },
  {
    nombreCompleto: 'Ing. Sofia Mamani Quispe',
    ci: '4321098',
    profesion: 'Ingeniería Hidráulica',
    matriculaProfesional: 'HID-67890',
    especialidad: 'SANEAMIENTO',
    experienciaAnios: 9,
    rol: 'FISCAL',
    telefono: '591-76789012',
    email: 'smamani@sdop.bo',
  },
];

// Datos de proyectos extraídos de los informes de rendición de cuentas 2025
const proyectos = [
  // CAMINOS
  {
    codigoSisin: '2025-001',
    codigoInterno: 'PROY-CAM-001',
    nombre: 'CONSTRUCCION Y ASFALTADO DE LA JOYA – CHUQUICHAMBI, HUAYLLAMARCA – TOTORA Y LOS PUENTES VEHICULARES LA JOYA Y CRUCERO EN LA RVF 031',
    tipo: 'CAMINO',
    departamento: 'Oruro',
    provincia: 'Sajama',
    municipio: 'Huayllamarca',
    presupuestoTotal: 7425000,
    fuenteFinanciamiento: 'TGN',
    estado: 'EJECUCION',
    avanceFisico: 35,
    avanceFinanciero: 30,
    fechaInicioContrato: new Date('2025-01-15'),
    fechaFinContrato: new Date('2026-06-30'),
    plazoDias: 540,
    numeroContrato: 'GADOR-2025-CAM-001',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
  },
  {
    codigoSisin: '2025-002',
    codigoInterno: 'PROY-CAM-002',
    nombre: 'CONSTRUCCION DE LA CARRETERA DOBLE VIA ORURO – CHALLAPATA TRAMO I ORURO – CRUCE VINTO – CRUCE HUANUNI',
    tipo: 'CAMINO',
    departamento: 'Oruro',
    provincia: 'Cercado',
    municipio: 'Oruro',
    coordenadas: { lat: -17.9833, lng: -67.1500 },
    presupuestoTotal: 33000000,
    fuenteFinanciamiento: 'CREDITO',
    estado: 'DISEÑO',
    avanceFisico: 15,
    avanceFinanciero: 10,
    fechaInicioContrato: new Date('2025-03-01'),
    fechaFinContrato: new Date('2027-12-31'),
    plazoDias: 1000,
    numeroContrato: 'GADOR-2025-CAM-002',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
  },
  {
    codigoSisin: '2025-003',
    codigoInterno: 'PROY-CAM-003',
    nombre: 'CONST. ASFALTADO CRUCE SAN MIGUEL SECTOR JACHUYO',
    tipo: 'CAMINO',
    departamento: 'Oruro',
    provincia: 'Cercado',
    municipio: 'Soracachi',
    presupuestoTotal: 2500000,
    fuenteFinanciamiento: 'IDH',
    estado: 'EJECUCION',
    avanceFisico: 60,
    avanceFinanciero: 55,
    fechaInicioContrato: new Date('2024-09-01'),
    fechaFinContrato: new Date('2025-08-31'),
    plazoDias: 365,
    numeroContrato: 'GADOR-2024-CAM-045',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
  },
  {
    codigoSisin: '2025-004',
    codigoInterno: 'PROY-CAM-004',
    nombre: 'MEJ. C/ASF. CRUCE RT F12 OBRAJES TOLAPALCA',
    tipo: 'CAMINO',
    departamento: 'Oruro',
    provincia: 'Cercado',
    municipio: 'Oruro',
    presupuestoTotal: 1800000,
    fuenteFinanciamiento: 'COMPETENCIA',
    estado: 'EJECUCION',
    avanceFisico: 45,
    avanceFinanciero: 40,
    fechaInicioContrato: new Date('2025-02-01'),
    fechaFinContrato: new Date('2025-11-30'),
    plazoDias: 300,
    numeroContrato: 'GADOR-2025-CAM-004',
    modalidadContratacion: 'CONTRATACION_DIRECTA',
  },

  // ELECTRIFICACION
  {
    codigoSisin: '2025-005',
    codigoInterno: 'PROY-ELE-001',
    nombre: 'CONST. ELECTRIFICACIÓN PROVINCIA CERCADO FASE II',
    tipo: 'ELECTRIFICACION',
    departamento: 'Oruro',
    provincia: 'Cercado',
    municipio: 'Oruro',
    presupuestoTotal: 4347624,
    fuenteFinanciamiento: 'IDH',
    estado: 'EJECUCION',
    avanceFisico: 50,
    avanceFinanciero: 45,
    fechaInicioContrato: new Date('2024-11-01'),
    fechaFinContrato: new Date('2026-04-30'),
    plazoDias: 540,
    numeroContrato: 'GADOR-2024-ELE-023',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
    observaciones: '204.78 km de línea eléctrica de media tensión. 83.5 km de línea eléctrica en baja tensión.',
  },
  {
    codigoSisin: '2025-006',
    codigoInterno: 'PROY-ELE-002',
    nombre: 'CONST. ELECTRIFICACIÓN PROVINCIA LADISLAO CABRERA FASE III',
    tipo: 'ELECTRIFICACION',
    departamento: 'Oruro',
    provincia: 'Ladislao Cabrera',
    presupuestoTotal: 1200000,
    fuenteFinanciamiento: 'IDH',
    estado: 'EJECUCION',
    avanceFisico: 25,
    avanceFinanciero: 20,
    fechaInicioContrato: new Date('2025-04-01'),
    fechaFinContrato: new Date('2026-09-30'),
    plazoDias: 540,
    numeroContrato: 'GADOR-2025-ELE-006',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
  },
  {
    codigoSisin: '2025-007',
    codigoInterno: 'PROY-ELE-003',
    nombre: 'MEJ. CONVERSIÓN AMPLIACIÓN LÍNEA MONOFÁSICA A TRIFÁSICA PROV. NOR CARANGAS',
    tipo: 'ELECTRIFICACION',
    departamento: 'Oruro',
    provincia: 'Nor Carangas',
    presupuestoTotal: 980000,
    fuenteFinanciamiento: 'IDH',
    estado: 'EJECUCION',
    avanceFisico: 40,
    avanceFinanciero: 35,
    fechaInicioContrato: new Date('2025-01-15'),
    fechaFinContrato: new Date('2025-12-31'),
    plazoDias: 350,
    numeroContrato: 'GADOR-2025-ELE-007',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
  },
  {
    codigoSisin: '2025-008',
    codigoInterno: 'PROY-ELE-004',
    nombre: 'CONST. ELECTRIFICACIÓN COMUNIDADES PROVINCIA AVAROA',
    tipo: 'ELECTRIFICACION',
    departamento: 'Oruro',
    provincia: 'Abaroa',
    estado: 'DISEÑO',
    avanceFisico: 10,
    avanceFinanciero: 5,
    presupuestoTotal: 750000,
    fuenteFinanciamiento: 'IDH',
    fechaInicioContrato: new Date('2025-06-01'),
    fechaFinContrato: new Date('2026-05-31'),
    plazoDias: 365,
    numeroContrato: 'GADOR-2025-ELE-008',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
    observaciones: 'Estudio de Diseño Técnico de Pre-inversión E.D.T.P en proceso',
  },
  {
    codigoSisin: '2025-009',
    codigoInterno: 'PROY-ELE-005',
    nombre: 'MEJ. CONVERSIÓN LÍNEA MONOFÁSICA A TRIFÁSICA MUNICIPIO QUILLACAS',
    tipo: 'ELECTRIFICACION',
    departamento: 'Oruro',
    provincia: 'Santuario de Quillacas',
    municipio: 'Quillacas',
    presupuestoTotal: 650000,
    fuenteFinanciamiento: 'IDH',
    estado: 'EJECUCION',
    avanceFisico: 55,
    avanceFinanciero: 50,
    fechaInicioContrato: new Date('2024-12-01'),
    fechaFinContrato: new Date('2025-10-31'),
    plazoDias: 330,
    numeroContrato: 'GADOR-2024-ELE-056',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
  },
  {
    codigoSisin: '2025-010',
    codigoInterno: 'PROY-ELE-006',
    nombre: 'CONST. ELECTRIFICACIÓN PROVINCIA LITORAL FASE II',
    tipo: 'ELECTRIFICACION',
    departamento: 'Oruro',
    provincia: 'Litoral',
    presupuestoTotal: 890000,
    fuenteFinanciamiento: 'IDH',
    estado: 'EJECUCION',
    avanceFisico: 30,
    avanceFinanciero: 25,
    fechaInicioContrato: new Date('2025-03-15'),
    fechaFinContrato: new Date('2026-03-14'),
    plazoDias: 365,
    numeroContrato: 'GADOR-2025-ELE-010',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
  },

  // AGUA_POTABLE Y SANEAMIENTO
  {
    codigoSisin: '2025-011',
    codigoInterno: 'PROY-AGUA-001',
    nombre: 'CONSTRUCCIÓN SISTEMA DE RIEGO TECNIFICADO PRESA CAWALLICALA',
    tipo: 'AGUA_POTABLE',
    departamento: 'Oruro',
    provincia: 'Sajama',
    municipio: 'Huayllamarca',
    presupuestoTotal: 26784170.94,
    fuenteFinanciamiento: 'CREDITO',
    estado: 'EJECUCION',
    avanceFisico: 65,
    avanceFinanciero: 60,
    fechaInicioContrato: new Date('2023-06-01'),
    fechaFinContrato: new Date('2026-12-31'),
    plazoDias: 1300,
    numeroContrato: 'GADOR-2023-AGUA-012',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
    observaciones: 'Embalse de agua y vertedero de excedencias. Presa de hormigón ciclópeo. Total a invertido Bs. 51.5 Millones',
  },
  {
    codigoSisin: '2025-012',
    codigoInterno: 'PROY-AGUA-002',
    nombre: 'CONSTRUCCIÓN PERFORACIÓN DE POZOS PROFUNDOS Y MANEJO DE AGUAS SUBTERRANEAS DEL DPTO. ORURO',
    tipo: 'AGUA_POTABLE',
    departamento: 'Oruro',
    presupuestoTotal: 1534552,
    fuenteFinanciamiento: 'TGN',
    estado: 'EJECUCION',
    avanceFisico: 40,
    avanceFinanciero: 35,
    fechaInicioContrato: new Date('2025-01-01'),
    fechaFinContrato: new Date('2025-12-31'),
    plazoDias: 365,
    numeroContrato: 'GADOR-2025-AGUA-012',
    modalidadContratacion: 'CONTRATACION_DIRECTA',
    observaciones: '20 pozos profundos perforados. 20 pruebas de bombeo. 15 limpiezas de pozos profundos.',
  },
  {
    codigoSisin: '2025-013',
    codigoInterno: 'PROY-SAN-001',
    nombre: 'MANEJO INTEGRAL DE LA MICROCUENCA TURCO',
    tipo: 'SANEAMIENTO',
    departamento: 'Oruro',
    provincia: 'Sajama',
    municipio: 'Turco',
    presupuestoTotal: 3762336.31,
    fuenteFinanciamiento: 'IDH',
    estado: 'EJECUCION',
    avanceFisico: 55,
    avanceFinanciero: 50,
    fechaInicioContrato: new Date('2024-08-01'),
    fechaFinContrato: new Date('2026-02-28'),
    plazoDias: 540,
    numeroContrato: 'GADOR-2024-SAN-034',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
  },
  {
    codigoSisin: '2025-014',
    codigoInterno: 'PROY-SAN-002',
    nombre: 'MANEJO INTEGRAL DE LA MICROCUENCA DEL RIO URMIRI DE PAZÑA',
    tipo: 'SANEAMIENTO',
    departamento: 'Oruro',
    provincia: 'Puerto de Mejillones',
    municipio: 'Pazña',
    presupuestoTotal: 3538293.42,
    fuenteFinanciamiento: 'IDH',
    estado: 'EJECUCION',
    avanceFisico: 70,
    avanceFinanciero: 65,
    fechaInicioContrato: new Date('2024-05-01'),
    fechaFinContrato: new Date('2025-10-31'),
    plazoDias: 540,
    numeroContrato: 'GADOR-2024-SAN-023',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
    observaciones: 'En auditoría',
  },
  {
    codigoSisin: '2025-015',
    codigoInterno: 'PROY-SAN-003',
    nombre: 'MANEJO INTEGRAL DE LA CUENCA VICHAJLUPE',
    tipo: 'SANEAMIENTO',
    departamento: 'Oruro',
    provincia: 'Saucarí',
    municipio: 'Santiago de Huari',
    presupuestoTotal: 4148922.27,
    fuenteFinanciamiento: 'IDH',
    estado: 'EJECUCION',
    avanceFisico: 45,
    avanceFinanciero: 40,
    fechaInicioContrato: new Date('2025-02-01'),
    fechaFinContrato: new Date('2026-07-31'),
    plazoDias: 540,
    numeroContrato: 'GADOR-2025-SAN-015',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
  },
  {
    codigoSisin: '2025-016',
    codigoInterno: 'PROY-SAN-004',
    nombre: 'MANEJO INTEGRAL DE LA CUENCA DEL RIO BARRAS',
    tipo: 'SANEAMIENTO',
    departamento: 'Oruro',
    provincia: 'Sajama',
    municipio: 'Corque',
    presupuestoTotal: 2138998.67,
    fuenteFinanciamiento: 'IDH',
    estado: 'EJECUCION',
    avanceFisico: 35,
    avanceFinanciero: 30,
    fechaInicioContrato: new Date('2025-03-01'),
    fechaFinContrato: new Date('2026-02-28'),
    plazoDias: 365,
    numeroContrato: 'GADOR-2025-SAN-016',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
  },
  {
    codigoSisin: '2025-017',
    codigoInterno: 'PROY-SAN-005',
    nombre: 'MANEJO DEL SISTEMA ACUÍFERO CHALLAPAMPA, PARIA Y COCHIRAYA',
    tipo: 'AGUA_POTABLE',
    departamento: 'Oruro',
    provincia: 'Cercado',
    municipio: 'Paria',
    presupuestoTotal: 6781284,
    fuenteFinanciamiento: 'CREDITO',
    estado: 'EJECUCION',
    avanceFisico: 50,
    avanceFinanciero: 45,
    fechaInicioContrato: new Date('2024-10-01'),
    fechaFinContrato: new Date('2026-09-30'),
    plazoDias: 720,
    numeroContrato: 'GADOR-2024-SAN-045',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
    observaciones: 'Proyecto estratégico en ejecución',
  },

  // EDIFICACION
  {
    codigoSisin: '2025-018',
    codigoInterno: 'PROY-EDIF-001',
    nombre: 'CONST. CASA DE ACOGIDA Y REFUGIO TEMPORAL DEPARTAMENTO DE ORURO',
    tipo: 'EDIFICACION',
    departamento: 'Oruro',
    provincia: 'Cercado',
    municipio: 'Oruro',
    coordenadas: { lat: -17.9667, lng: -67.1167 },
    presupuestoTotal: 8205786.35,
    fuenteFinanciamiento: 'CREDITO',
    estado: 'EJECUCION',
    avanceFisico: 55,
    avanceFinanciero: 50,
    fechaInicioContrato: new Date('2024-07-01'),
    fechaFinContrato: new Date('2026-06-30'),
    plazoDias: 720,
    numeroContrato: 'GADOR-2024-EDIF-018',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
  },
  {
    codigoSisin: '2025-019',
    codigoInterno: 'PROY-EDIF-002',
    nombre: 'CONST. CENTRO DE EDUCACIÓN ESPECIAL GHISLAIN DUBE - MUNICIPIO ORURO',
    tipo: 'EDIFICACION',
    departamento: 'Oruro',
    provincia: 'Cercado',
    municipio: 'Oruro',
    presupuestoTotal: 5326655.20,
    fuenteFinanciamiento: 'TGN',
    estado: 'EJECUCION',
    avanceFisico: 40,
    avanceFinanciero: 35,
    fechaInicioContrato: new Date('2025-01-15'),
    fechaFinContrato: new Date('2026-06-30'),
    plazoDias: 530,
    numeroContrato: 'GADOR-2025-EDIF-019',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
  },
  {
    codigoSisin: '2025-020',
    codigoInterno: 'PROY-EDIF-003',
    nombre: 'CONST. UNIDAD EDUCATIVA ORURO SECUNDARIA - MUNICIPIO ORURO',
    tipo: 'EDIFICACION',
    departamento: 'Oruro',
    provincia: 'Cercado',
    municipio: 'Oruro',
    presupuestoTotal: 11219773.42,
    fuenteFinanciamiento: 'TGN',
    estado: 'EJECUCION',
    avanceFisico: 30,
    avanceFinanciero: 25,
    fechaInicioContrato: new Date('2025-02-01'),
    fechaFinContrato: new Date('2026-12-31'),
    plazoDias: 700,
    numeroContrato: 'GADOR-2025-EDIF-020',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
  },
  {
    codigoSisin: '2025-021',
    codigoInterno: 'PROY-EDIF-004',
    nombre: 'CONST. INSTITUTO SUPERIOR TECNOLOGICO AGROINDUSTRIAL "SAJAMA" – MUNICIPIO CORQUE',
    tipo: 'EDIFICACION',
    departamento: 'Oruro',
    provincia: 'Sajama',
    municipio: 'Corque',
    presupuestoTotal: 8337288.60,
    fuenteFinanciamiento: 'TGN',
    estado: 'EJECUCION',
    avanceFisico: 35,
    avanceFinanciero: 30,
    fechaInicioContrato: new Date('2025-01-15'),
    fechaFinContrato: new Date('2026-09-30'),
    plazoDias: 620,
    numeroContrato: 'GADOR-2025-EDIF-021',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
  },
  {
    codigoSisin: '2025-022',
    codigoInterno: 'PROY-EDIF-005',
    nombre: 'CONST. INSTITUTO TECNOLOGICO SUPERIOR MARKA QAQACHACA – MUNICIPIO CHALLAPATA',
    tipo: 'EDIFICACION',
    departamento: 'Oruro',
    provincia: 'Challapata',
    municipio: 'Challapata',
    presupuestoTotal: 7555235.95,
    fuenteFinanciamiento: 'TGN',
    estado: 'EJECUCION',
    avanceFisico: 25,
    avanceFinanciero: 20,
    fechaInicioContrato: new Date('2025-03-01'),
    fechaFinContrato: new Date('2026-11-30'),
    plazoDias: 640,
    numeroContrato: 'GADOR-2025-EDIF-022',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
  },
  {
    codigoSisin: '2025-023',
    codigoInterno: 'PROY-EDIF-006',
    nombre: 'RESTAURACION E IMPLEMENTACION TEATRO PALAIS CONCERT',
    tipo: 'EDIFICACION',
    departamento: 'Oruro',
    provincia: 'Cercado',
    municipio: 'Oruro',
    presupuestoTotal: 6635421.37,
    fuenteFinanciamiento: 'COMPETENCIA',
    estado: 'EJECUCION',
    avanceFisico: 60,
    avanceFinanciero: 55,
    fechaInicioContrato: new Date('2024-09-01'),
    fechaFinContrato: new Date('2025-12-31'),
    plazoDias: 480,
    numeroContrato: 'GADOR-2024-EDIF-056',
    modalidadContratacion: 'CONTRATACION_DIRECTA',
  },

  // PUENTE
  {
    codigoSisin: '2025-024',
    codigoInterno: 'PROY-PUE-001',
    nombre: 'CONSTRUCCION PASO A DESNIVEL AVENIDA VILLARROEL Y CIRCUNVALACION (ORURO)',
    tipo: 'PUENTE',
    departamento: 'Oruro',
    provincia: 'Cercado',
    municipio: 'Oruro',
    coordenadas: { lat: -17.9750, lng: -67.1250 },
    presupuestoTotal: 33000000,
    fuenteFinanciamiento: 'CREDITO',
    estado: 'DISEÑO',
    avanceFisico: 20,
    avanceFinanciero: 15,
    fechaInicioContrato: new Date('2025-04-01'),
    fechaFinContrato: new Date('2027-12-31'),
    plazoDias: 1000,
    numeroContrato: 'GADOR-2025-PUE-001',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
    observaciones: 'En proceso de financiamiento con la UPRE',
  },
  {
    codigoSisin: '2025-025',
    codigoInterno: 'PROY-PUE-002',
    nombre: 'CONSTRUCCION PASO A DESNIVEL CALLE GREGORIO REYNOLDS Y CIRCUNVALACION (ORURO)',
    tipo: 'PUENTE',
    departamento: 'Oruro',
    provincia: 'Cercado',
    municipio: 'Oruro',
    coordenadas: { lat: -17.9800, lng: -67.1300 },
    presupuestoTotal: 32000000,
    fuenteFinanciamiento: 'CREDITO',
    estado: 'DISEÑO',
    avanceFisico: 15,
    avanceFinanciero: 10,
    fechaInicioContrato: new Date('2025-05-01'),
    fechaFinContrato: new Date('2027-12-31'),
    plazoDias: 960,
    numeroContrato: 'GADOR-2025-PUE-002',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
    observaciones: 'En proceso de financiamiento con la UPRE',
  },

  // OTRO - Proyectos macro
  {
    codigoSisin: '2025-026',
    codigoInterno: 'PROY-OTRO-001',
    nombre: 'EMBOVEDADO DEL RIO HUANUNI',
    tipo: 'OTRO',
    departamento: 'Oruro',
    provincia: 'Saucarí',
    municipio: 'Huanuni',
    presupuestoTotal: 47000000,
    fuenteFinanciamiento: 'CREDITO',
    estado: 'PRE_INVERSION',
    avanceFisico: 5,
    avanceFinanciero: 2,
    fechaInicioContrato: new Date('2025-06-01'),
    fechaFinContrato: new Date('2028-12-31'),
    plazoDias: 1300,
    numeroContrato: 'GADOR-2025-OTRO-001',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
    observaciones: 'Se ha solicitado el financiamiento ante el MMAYA',
  },
  {
    codigoSisin: '2025-027',
    codigoInterno: 'PROY-OTRO-002',
    nombre: 'CONSTRUCCIÓN PRESA MULTIPROPOSITO RIEGO Y AGUA POTABLE CONDORCHINOCA (SORACACHI)',
    tipo: 'AGUA_POTABLE',
    departamento: 'Oruro',
    provincia: 'Cercado',
    municipio: 'Soracachi',
    presupuestoTotal: 111000000,
    fuenteFinanciamiento: 'CREDITO',
    estado: 'PRE_INVERSION',
    avanceFisico: 3,
    avanceFinanciero: 1,
    fechaInicioContrato: new Date('2025-07-01'),
    fechaFinContrato: new Date('2029-06-30'),
    plazoDias: 1460,
    numeroContrato: 'GADOR-2025-OTRO-002',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
    observaciones: 'En gestiones de financiamiento gestionado ante el MMAYA',
  },
  {
    codigoSisin: '2025-028',
    codigoInterno: 'PROY-OTRO-003',
    nombre: 'CONSTRUCCION PLATAFORMA LOGISTICA MULTIMODAL PUERTO SECO DEPARTAMENTO DE ORURO',
    tipo: 'OTRO',
    departamento: 'Oruro',
    provincia: 'Cercado',
    municipio: 'Oruro',
    presupuestoTotal: 45000000,
    fuenteFinanciamiento: 'CREDITO',
    estado: 'EJECUCION',
    avanceFisico: 40,
    avanceFinanciero: 35,
    fechaInicioContrato: new Date('2024-06-01'),
    fechaFinContrato: new Date('2027-05-31'),
    plazoDias: 1095,
    numeroContrato: 'GADOR-2024-OTRO-045',
    modalidadContratacion: 'CONVOCATORIA_PUBLICA',
    observaciones: 'Conclusión del Paquete II para el funcionamiento del proyecto',
  },
];

async function seedDatabase() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sdop_gestion');
    console.log('Conexión exitosa a MongoDB');

    // Limpiar datos existentes
    console.log('\nLimpiando datos existentes...');
    await HitoPresupuestario.deleteMany({});
    await Proyecto.deleteMany({});
    await Empresa.deleteMany({});
    await PersonaTecnica.deleteMany({});
    await UnidadOrganizativa.deleteMany({});
    await Usuario.deleteMany({});
    await PortafolioProyecto.deleteMany({});
    await ProgramacionEjecucion.deleteMany({});
    await PresupuestoBase.deleteMany({});
    await EficienciaEnergetica.deleteMany({});
    await SolicitudFinanciamiento.deleteMany({});
    await PlanMovilidad.deleteMany({});
    await CapacitacionSimulacro.deleteMany({});
    await PlanCoberturaSaneamiento.deleteMany({});
    await GestionAmbiental.deleteMany({});
    console.log('Datos existentes eliminados');

    // Insertar unidades organizativas
    console.log('\nInsertando unidades organizativas...');
    const unidadesInsertadas = await UnidadOrganizativa.insertMany(unidades);
    console.log(`${unidadesInsertadas.length} unidades insertadas`);

    // Crear mapa de codigo -> id
    const unidadMap = {};
    unidadesInsertadas.forEach(u => { unidadMap[u.codigo] = u._id; });

    // Crear usuario ADMIN por defecto
    console.log('\nCreando usuario ADMIN por defecto...');
    const adminUser = await Usuario.create({
      nombre: 'Administrador SDOP',
      email: 'admin@sdop.bo',
      password: 'Admin123!',
      rol: 'ADMIN',
      unidadesAcceso: unidadesInsertadas.map(u => u._id),
      activo: true,
    });
    console.log(`Usuario ADMIN creado: ${adminUser.email}`);

    // Crear usuarios de prueba para otros roles
    const usuariosPrueba = [
      {
        nombre: 'Ing. Fernando Torrez Mamani',
        email: 'ftorrez@sdop.bo',
        password: 'Supervisor123!',
        rol: 'SUPERVISOR',
        unidadesAcceso: [unidadMap['JT'], unidadMap['DI']],
        activo: true,
      },
      {
        nombre: 'Ing. Pedro Huanca Flores',
        email: 'phuanca@sdop.bo',
        password: 'Inspector123!',
        rol: 'INSPECTOR',
        unidadesAcceso: [unidadMap['JUS']],
        activo: true,
      },
      {
        nombre: 'Ing. Diego Condori Vargas',
        email: 'dcondori@sdop.bo',
        password: 'Fiscal123!',
        rol: 'FISCAL',
        unidadesAcceso: unidadesInsertadas.map(u => u._id),
        activo: true,
      },
      {
        nombre: 'Usuario Visor',
        email: 'visor@sdop.bo',
        password: 'Visor123!',
        rol: 'VISOR',
        unidadesAcceso: [unidadMap['DI']],
        activo: true,
      },
    ];

    const usuariosCreados = await Usuario.insertMany(usuariosPrueba);
    console.log(`${usuariosCreados.length} usuarios de prueba creados`);

    // Insertar empresas
    console.log('\nInsertando empresas...');
    const empresasInsertadas = await Empresa.insertMany(empresas);
    console.log(`${empresasInsertadas.length} empresas insertadas`);

    // Insertar personas técnicas
    console.log('\nInsertando personas técnicas...');
    const personasInsertadas = await PersonaTecnica.insertMany(personasTecnicas);
    console.log(`${personasInsertadas.length} personas técnicas insertadas`);

    // Asignar empresas y personas técnicas a proyectos
    console.log('\nAsignando empresas y personas técnicas a proyectos...');
    const proyectosConRelaciones = proyectos.map((proyecto, index) => {
      const empresaIndex = index % empresasInsertadas.length;
      const supervisorIndex = index % personasInsertadas.length;
      const inspectorIndex = (index + 1) % personasInsertadas.length;
      const fiscalIndex = (index + 2) % personasInsertadas.length;
      const unidadCodigo = tipoToUnidad[proyecto.tipo] || 'DI';

      return {
        ...proyecto,
        empresaId: empresasInsertadas[empresaIndex]._id,
        supervisorId: personasInsertadas[supervisorIndex]._id,
        inspectorId: personasInsertadas[inspectorIndex]._id,
        fiscalId: personasInsertadas[fiscalIndex]._id,
        unidadResponsable: unidadMap[unidadCodigo],
      };
    });

    // Insertar proyectos
    console.log('\nInsertando proyectos...');
    const proyectosInsertados = await Proyecto.insertMany(proyectosConRelaciones);
    console.log(`${proyectosInsertados.length} proyectos insertados`);

    // Crear hitos presupuestarios para cada proyecto
    console.log('\nCreando hitos presupuestarios...');
    const hitos = [];
    for (const proyecto of proyectosInsertados) {
      const numHitos = Math.floor(Math.random() * 3) + 3; // 3 a 5 hitos
      const montoPorHito = proyecto.presupuestoTotal / numHitos;

      for (let i = 1; i <= numHitos; i++) {
        hitos.push({
          proyectoId: proyecto._id,
          numero: i,
          descripcion: `Hito ${i}: ${getDescripcionHito(i, proyecto.tipo)}`,
          avanceFisicoMinimo: (i / numHitos) * 100,
          montoAsociado: montoPorHito,
          estado: getEstadoHito(i, proyecto.avanceFisico, numHitos),
          fechaCumplimiento: proyecto.avanceFisico >= (i / numHitos) * 100
            ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
            : null,
        });
      }
    }

    await HitoPresupuestario.insertMany(hitos);
    console.log(`${hitos.length} hitos presupuestarios creados`);

    // Sembrar feedbacks de prueba
    console.log('\nSembrando feedbacks de prueba...');
    const feedbacks = [
      {
        tipo: 'BUG',
        titulo: 'No se pueden subir fotos desde galería',
        descripcion: 'Cuando intento adjuntar una foto desde la galería del celular, la pantalla se queda cargando y no sube la imagen. Solo funciona con la cámara.',
        pagina: '/avances/6a0b67c2d48b801146048209/nuevo',
        prioridad: 'ALTA',
        estado: 'ABIERTO',
      },
      {
        tipo: 'MEJORA',
        titulo: 'Agregar filtro por fecha en avances',
        descripcion: 'Sería útil poder filtrar los avances por rango de fechas para ver los reportes de un mes específico.',
        pagina: '/avances',
        prioridad: 'MEDIA',
        estado: 'EN_PROGRESO',
        respuesta: 'Buena sugerencia, lo agregaremos en la próxima actualización.',
        fechaRespuesta: new Date(),
      },
      {
        tipo: 'NUEVA_FUNCIONALIDAD',
        titulo: 'Exportar reportes a PDF',
        descripcion: 'Necesitamos poder exportar los reportes de avance a PDF para imprimir y presentar a las autoridades.',
        pagina: '/proyectos/6a0b67c2d48b801146048209',
        prioridad: 'ALTA',
        estado: 'ABIERTO',
      },
      {
        tipo: 'BUG',
        titulo: 'El dashboard no muestra datos correctamente',
        descripcion: 'Al entrar al dashboard, las estadísticas aparecen en 0 por unos segundos antes de cargar. Debería mostrar un spinner de carga.',
        pagina: '/',
        prioridad: 'BAJA',
        estado: 'RESUELTO',
        respuesta: 'Corregido en la última actualización.',
        fechaRespuesta: new Date(),
      },
      {
        tipo: 'MEJORA',
        titulo: 'Mejorar la navegación en móviles',
        descripcion: 'El menú lateral es difícil de usar en celulares. Sería mejor un menú inferior con iconos como las apps móviles.',
        pagina: '/proyectos',
        prioridad: 'MEDIA',
        estado: 'ABIERTO',
      },
      {
        tipo: 'NUEVA_FUNCIONALIDAD',
        titulo: 'Notificaciones por email',
        descripcion: 'Quisiera recibir un email cuando un avance sea aprobado o observado, para no tener que estar revisando constantemente.',
        pagina: '/avances',
        prioridad: 'MEDIA',
        estado: 'ABIERTO',
      },
      {
        tipo: 'OTRO',
        titulo: 'Falta documentación del sistema',
        descripcion: 'No hay un manual de usuario para los inspectores nuevos. Sería bueno tener una guía rápida.',
        pagina: '/dashboard',
        prioridad: 'BAJA',
        estado: 'ABIERTO',
      },
    ];

    await Feedback.insertMany(feedbacks);
    console.log(`${feedbacks.length} feedbacks sembrados`);

    // Sembrar nuevos modelos - DI
    console.log('\nSembrando modelos DI (Dirección de Infraestructura)...');
    const portafolioProyectos = [
      { codigo: 'PORT-DI-001', nombre: 'Ficha Técnica - Camino Oruro-Challapata', tipo: 'FICHA_TECNICA', unidadResponsable: unidadMap['DI'], municipio: 'Oruro', descripcion: 'Estudio de pre-inversión para camino doble vía', beneficiarios: 50000, presupuestoEstimado: 33000000, estado: 'APROBADO', fechaElaboracion: new Date('2024-06-01'), fechaAprobacion: new Date('2024-09-15') },
      { codigo: 'PORT-DI-002', nombre: 'Diseño Final - Casa de Acogida', tipo: 'DISEÑO_FINAL', unidadResponsable: unidadMap['DI'], municipio: 'Oruro', descripcion: 'Diseño técnico final para casa de acogida departamental', beneficiarios: 200, presupuestoEstimado: 8205786, estado: 'EN_ELABORACION', fechaElaboracion: new Date('2025-01-15') },
      { codigo: 'PORT-DI-003', nombre: 'Pre-inversión - Teatro Palais Concert', tipo: 'PRE_INVERSION', unidadResponsable: unidadMap['DI'], municipio: 'Oruro', descripcion: 'Estudio de pre-inversión para restauración del teatro', beneficiarios: 5000, presupuestoEstimado: 6635421, estado: 'REVISION', fechaElaboracion: new Date('2024-03-01') },
    ];
    await PortafolioProyecto.insertMany(portafolioProyectos);
    console.log(`${portafolioProyectos.length} portafolios de proyecto sembrados`);

    const programacionesEjecucion = [
      { codigo: 'PROG-DI-001', nombre: 'Programación Q1 2025 - Infraestructura', unidadResponsable: unidadMap['DI'], gestion: 2025, trimestre: 1, avanceFisicoProgramado: 25, avanceFisicoEjecutado: 22, avanceFinancieroProgramado: 25, avanceFinancieroEjecutado: 20, presupuestoAsignado: 50000000, presupuestoEjecutado: 40000000, estado: 'EN_EJECUCION' },
      { codigo: 'PROG-DI-002', nombre: 'Programación Q2 2025 - Infraestructura', unidadResponsable: unidadMap['DI'], gestion: 2025, trimestre: 2, avanceFisicoProgramado: 50, avanceFisicoEjecutado: 0, avanceFinancieroProgramado: 50, avanceFinancieroEjecutado: 0, presupuestoAsignado: 50000000, estado: 'PROGRAMADO' },
    ];
    await ProgramacionEjecucion.insertMany(programacionesEjecucion);
    console.log(`${programacionesEjecucion.length} programaciones de ejecución sembradas`);

    const presupuestosBase = [
      { codigo: 'PRES-DI-001', nombre: 'Presupuesto Base DI 2025', unidadResponsable: unidadMap['DI'], gestion: 2025, tipoPresupuesto: 'BASE', montoTotal: 100000000, montoEjecutado: 40000000, estado: 'EN_EJECUCION', partidas: [{ codigo: '101', descripcion: 'Caminos', montoAsignado: 60000000, montoEjecutado: 25000000 }, { codigo: '102', descripcion: 'Edificios', montoAsignado: 40000000, montoEjecutado: 15000000 }] },
      { codigo: 'PRES-DI-002', nombre: 'Flujo Efectividad DI 2025', unidadResponsable: unidadMap['DI'], gestion: 2025, tipoPresupuesto: 'FLUJO_EFECTIVIDAD', montoTotal: 100000000, flujosMensuales: [{ mes: 1, montoProgramado: 8000000, montoEjecutado: 7500000 }, { mes: 2, montoProgramado: 8000000, montoEjecutado: 7000000 }], estado: 'EN_EJECUCION' },
    ];
    await PresupuestoBase.insertMany(presupuestosBase);
    console.log(`${presupuestosBase.length} presupuestos base sembrados`);

    // Sembrar nuevos modelos - JE
    console.log('\nSembrando modelos JE (Jefatura de Energía)...');
    const eficienciasEnergeticas = [
      { codigo: 'EE-JE-001', edificio: 'Gobernación Departamental', unidadResponsable: unidadMap['JE'], municipio: 'Oruro', tipoEdificio: 'OFICINA_GUBERNAMENTAL', consumoActualKwh: 15000, consumoObjetivoKwh: 10000, ahorroEstimadoPorcentaje: 33, medidas: [{ descripcion: 'Instalación de paneles solares', costoEstimado: 200000, ahorroEstimado: 5000, estado: 'APROBADA' }], diagnosticoFecha: new Date('2025-01-15'), estado: 'PLANIFICACION' },
      { codigo: 'EE-JE-002', edificio: 'Hospital General', unidadResponsable: unidadMap['JE'], municipio: 'Oruro', tipoEdificio: 'HOSPITAL', consumoActualKwh: 25000, consumoObjetivoKwh: 18000, ahorroEstimadoPorcentaje: 28, estado: 'DIAGNOSTICO' },
    ];
    await EficienciaEnergetica.insertMany(eficienciasEnergeticas);
    console.log(`${eficienciasEnergeticas.length} eficiencias energéticas sembradas`);

    const solicitudesFinanciamiento = [
      { codigo: 'SOL-JE-001', nombre: 'Financiamiento Electrificación Rural Fase IV', unidadResponsable: unidadMap['JE'], entidadFinanciera: 'CAF', montoSolicitado: 15000000, moneda: 'USD', tipoFinanciamiento: 'PRESTAMO', estado: 'EN_EVALUACION', fechaSolicitud: new Date('2025-02-01') },
      { codigo: 'SOL-JE-002', nombre: 'Donación Energía Solar Comunidades', unidadResponsable: unidadMap['JE'], entidadFinanciera: 'Banco Mundial', montoSolicitado: 5000000, moneda: 'USD', tipoFinanciamiento: 'DONACION', estado: 'APROBADA', fechaSolicitud: new Date('2024-11-01'), fechaRespuesta: new Date('2025-01-15') },
    ];
    await SolicitudFinanciamiento.insertMany(solicitudesFinanciamiento);
    console.log(`${solicitudesFinanciamiento.length} solicitudes de financiamiento sembradas`);

    // Sembrar nuevos modelos - JT
    console.log('\nSembrando modelos JT (Jefatura de Transporte)...');
    const planesMovilidad = [
      { codigo: 'PM-JT-001', nombre: 'Plan Movilidad Urbana Oruro 2025-2030', unidadResponsable: unidadMap['JT'], ambito: 'URBANO', municipio: 'Oruro', diagnostico: 'Alta congestión vehicular en zona central', objetivos: ['Reducir tiempos de viaje', 'Mejorar transporte público'], acciones: [{ descripcion: 'Implementación de ciclovías', prioridad: 'ALTA', plazo: '12 meses', costoEstimado: 2000000, estado: 'APROBADA' }], estado: 'EN_EJECUCION', fechaAprobacion: new Date('2025-01-15') },
      { codigo: 'PM-JT-002', nombre: 'Plan Movilidad Rural Sajama', unidadResponsable: unidadMap['JT'], ambito: 'RURAL', municipio: 'Huayllamarca', estado: 'ELABORACION' },
    ];
    await PlanMovilidad.insertMany(planesMovilidad);
    console.log(`${planesMovilidad.length} planes de movilidad sembrados`);

    // Sembrar nuevos modelos - JUPRE
    console.log('\nSembrando modelos JUPRE (Prevención Riesgos)...');
    const capacitacionesSimulacros = [
      { codigo: 'CAP-JUPRE-001', nombre: 'Simulacro Sismo Oruro 2025', unidadResponsable: unidadMap['JUPRE'], tipo: 'SIMULACRO', tema: 'Respuesta ante sismos', municipio: 'Oruro', fechaProgramada: new Date('2025-06-15'), participantesObjetivo: 500, duracion: '4 horas', estado: 'PROGRAMADO' },
      { codigo: 'CAP-JUPRE-002', nombre: 'Capacitación Primeros Auxilios', unidadResponsable: unidadMap['JUPRE'], tipo: 'CAPACITACION', tema: 'Primeros auxilios básicos', municipio: 'Challapata', fechaProgramada: new Date('2025-04-20'), fechaRealizada: new Date('2025-04-20'), participantes: 45, participantesObjetivo: 50, duracion: '8 horas', facilitador: 'Cruz Roja Oruro', estado: 'REALIZADO', evaluacion: { satisfaccion: 4.5, aprendizaje: 4.2 } },
    ];
    await CapacitacionSimulacro.insertMany(capacitacionesSimulacros);
    console.log(`${capacitacionesSimulacros.length} capacitaciones/simulacros sembrados`);

    // Sembrar nuevos modelos - JUS
    console.log('\nSembrando modelos JUS (Saneamiento)...');
    const planesCobertura = [
      { codigo: 'PCS-JUS-001', nombre: 'Plan Cobertura Agua Potable Cercado', unidadResponsable: unidadMap['JUS'], municipio: 'Oruro', provincia: 'Cercado', tipoSaneamiento: 'AGUA_POTABLE', coberturaActualPorcentaje: 75, coberturaObjetivoPorcentaje: 95, poblacionBeneficiaria: 30000, familiasBeneficiarias: 8000, acciones: [{ descripcion: 'Ampliación red de distribución zona sur', tipo: 'AMPLIACION', costoEstimado: 5000000, plazo: '18 meses', estado: 'APROBADA' }], estado: 'EN_EJECUCION', fechaAprobacion: new Date('2025-01-10') },
      { codigo: 'PCS-JUS-002', nombre: 'Plan Alcantarillado Sajama', unidadResponsable: unidadMap['JUS'], municipio: 'Huayllamarca', provincia: 'Sajama', tipoSaneamiento: 'ALCANTARILLADO', coberturaActualPorcentaje: 30, coberturaObjetivoPorcentaje: 70, estado: 'ELABORACION' },
    ];
    await PlanCoberturaSaneamiento.insertMany(planesCobertura);
    console.log(`${planesCobertura.length} planes de cobertura sembrados`);

    const gestionesAmbientales = [
      { codigo: 'GA-JUS-001', nombre: 'EIA Presa Cawallicala', unidadResponsable: unidadMap['JUS'], municipio: 'Huayllamarca', tipoEvaluacion: 'EIA', componente: 'AGUA', impactoIdentificado: 'Alteración de caudal ecológico', nivelImpacto: 'MEDIO', medidasMitigacion: [{ descripcion: 'Caudal ecológico mínimo', costoEstimado: 500000, estado: 'EN_EJECUCION' }], estado: 'EN_EJECUCION', fechaEvaluacion: new Date('2024-06-01') },
      { codigo: 'GA-JUS-002', nombre: 'Monitoreo Calidad Agua Paria', unidadResponsable: unidadMap['JUS'], municipio: 'Paria', tipoEvaluacion: 'MONITOREO', componente: 'AGUA', impactoIdentificado: 'Contaminación por actividades mineras', nivelImpacto: 'ALTO', estado: 'EN_EVALUACION', fechaEvaluacion: new Date('2025-03-01') },
    ];
    await GestionAmbiental.insertMany(gestionesAmbientales);
    console.log(`${gestionesAmbientales.length} gestiones ambientales sembradas`);

    // Resumen
    console.log('\n===== RESUMEN DE SIEMBRA DE DATOS =====');
    console.log(`Unidades Organizativas: ${unidadesInsertadas.length}`);
    console.log(`Usuarios: ${usuariosCreados.length + 1} (incluye ADMIN)`);
    console.log(`Empresas: ${empresasInsertadas.length}`);
    console.log(`Personas Técnicas: ${personasInsertadas.length}`);
    console.log(`Proyectos: ${proyectosInsertados.length}`);
    console.log(`Hitos Presupuestarios: ${hitos.length}`);
    console.log(`Feedbacks: ${feedbacks.length}`);
    console.log(`Portafolio Proyectos: ${portafolioProyectos.length}`);
    console.log(`Programaciones Ejecución: ${programacionesEjecucion.length}`);
    console.log(`Presupuestos Base: ${presupuestosBase.length}`);
    console.log(`Eficiencias Energéticas: ${eficienciasEnergeticas.length}`);
    console.log(`Solicitudes Financiamiento: ${solicitudesFinanciamiento.length}`);
    console.log(`Planes Movilidad: ${planesMovilidad.length}`);
    console.log(`Capacitaciones/Simulacros: ${capacitacionesSimulacros.length}`);
    console.log(`Planes Cobertura Saneamiento: ${planesCobertura.length}`);
    console.log(`Gestiones Ambientales: ${gestionesAmbientales.length}`);
    
    console.log('\nDistribución de proyectos por unidad:');
    const porUnidad = {};
    unidadesInsertadas.forEach(u => { porUnidad[u.codigo] = 0; });
    proyectosInsertados.forEach(p => {
      const unidad = unidadesInsertadas.find(u => u._id.toString() === p.unidadResponsable?.toString());
      if (unidad) porUnidad[unidad.codigo] = (porUnidad[unidad.codigo] || 0) + 1;
    });
    Object.entries(porUnidad).forEach(([codigo, count]) => {
      const unidad = unidadesInsertadas.find(u => u.codigo === codigo);
      console.log(`  ${codigo} (${unidad?.nombre}): ${count}`);
    });

    console.log('\nDistribución de proyectos por tipo:');
    const tipos = {};
    proyectosInsertados.forEach(p => {
      tipos[p.tipo] = (tipos[p.tipo] || 0) + 1;
    });
    Object.entries(tipos).forEach(([tipo, count]) => {
      console.log(`  ${tipo}: ${count}`);
    });

    console.log('\nDistribución de proyectos por estado:');
    const estados = {};
    proyectosInsertados.forEach(p => {
      estados[p.estado] = (estados[p.estado] || 0) + 1;
    });
    Object.entries(estados).forEach(([estado, count]) => {
      console.log(`  ${estado}: ${count}`);
    });

    console.log('\nPresupuesto total de proyectos:');
    const totalPresupuesto = proyectosInsertados.reduce((sum, p) => sum + p.presupuestoTotal, 0);
    console.log(`  Bs. ${totalPresupuesto.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`);

    console.log('\n✅ Siembra de datos completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al sembrar datos:', error);
    process.exit(1);
  }
}

function getDescripcionHito(numero, tipo) {
  const descripciones = {
    CAMINO: [
      'Movimiento de tierras y nivelación',
      'Base granulométrica',
      'Capa asfáltica',
      'Señalización y obras complementarias',
      'Entrega final',
    ],
    PUENTE: [
      'Cimentación y pilotes',
      'Estructura principal',
      'Tablero y barandas',
      'Accesos y terminaciones',
      'Pruebas de carga y entrega',
    ],
    ELECTRIFICACION: [
      'Instalación de postes',
      'Tendido de líneas',
      'Instalación de transformadores',
      'Conexiones domiciliarias',
      'Pruebas y puesta en servicio',
    ],
    AGUA_POTABLE: [
      'Captación y obra de toma',
      'Línea de conducción',
      'Planta de tratamiento',
      'Red de distribución',
      'Pruebas de calidad y entrega',
    ],
    SANEAMIENTO: [
      'Obras de control de erosión',
      'Estructuras de disipación',
      'Canales y drenajes',
      'Revegetación y protección',
      'Entrega final',
    ],
    EDIFICACION: [
      'Cimentación y estructura',
      'Muros y losas',
      'Instalaciones eléctricas y sanitarias',
      'Acabados y equipamiento',
      'Entrega final',
    ],
    OTRO: [
      'Trabajos preliminares',
      'Estructura principal',
      'Instalaciones especializadas',
      'Terminaciones',
      'Entrega final',
    ],
  };

  const desc = descripciones[tipo] || descripciones.OTRO;
  return desc[numero - 1] || `Hito ${numero}`;
}

function getEstadoHito(numero, avanceFisico, totalHitos) {
  const porcentajeHito = (numero / totalHitos) * 100;
  
  if (avanceFisico >= porcentajeHito) {
    return Math.random() > 0.3 ? 'PAGADO' : 'CUMPLIDO';
  } else if (avanceFisico >= porcentajeHito - 20) {
    return 'PENDIENTE';
  } else {
    return 'PENDIENTE';
  }
}

seedDatabase();
