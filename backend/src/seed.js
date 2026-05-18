/**
 * Script para sembrar datos en la base de datos SDOP
 * Basado en información extraída de:
 * - INFORME-TECNICO-SDPD-No-038-2026_0001COMPRESO-1.pdf
 * - RENDICION_INICIAL_2025_30_ABRIL_2025.pdf
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Proyecto = require('./models/Proyecto');
const Empresa = require('./models/Empresa');
const PersonaTecnica = require('./models/PersonaTecnica');
const HitoPresupuestario = require('./models/HitoPresupuestario');

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
    console.log('Datos existentes eliminados');

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

      return {
        ...proyecto,
        empresaId: empresasInsertadas[empresaIndex]._id,
        supervisorId: personasInsertadas[supervisorIndex]._id,
        inspectorId: personasInsertadas[inspectorIndex]._id,
        fiscalId: personasInsertadas[fiscalIndex]._id,
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

    // Resumen
    console.log('\n===== RESUMEN DE SIEMBRA DE DATOS =====');
    console.log(`Empresas: ${empresasInsertadas.length}`);
    console.log(`Personas Técnicas: ${personasInsertadas.length}`);
    console.log(`Proyectos: ${proyectosInsertados.length}`);
    console.log(`Hitos Presupuestarios: ${hitos.length}`);
    
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
