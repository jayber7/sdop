/**
 * Simulación del Módulo de Subida de Fotografía con EXIF
 * 
 * Genera 3 imágenes con metadatos EXIF GPS diferentes y las sube
 * al backend para demostrar el flujo completo de verificación.
 * 
 * Escenarios:
 * 1. VERIFICADO - GPS cerca de la obra (~30m)
 * 2. SOSPECHOSO - GPS lejano (~5km)
 * 3. SOSPECHOSO - Sin GPS en EXIF (metadata inconsistente)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const piexif = require('piexifjs');
const axios = require('axios');

// ============================================================
// CONFIGURACIÓN
// ============================================================

const API_URL = process.env.API_BASE_URL || 'http://localhost:5001/api';
const IMAGES_DIR = path.join(__dirname, 'test-images');

// Coordenadas del proyecto PROY-EDIF-001
const PROYECTO = {
  id: '6a0b67c2d48b801146048209',
  nombre: 'CONST. CASA DE ACOGIDA Y REFUGIO TEMPORAL DEPARTAMENTO DE ORURO',
  codigoInterno: 'PROY-EDIF-001',
  coordenadas: { lat: -17.9667, lng: -67.1167 },
  presupuestoTotal: 8205786.35,
  avanceFisicoActual: 55,
};

// Escenarios de prueba
const ESCENARIOS = [
  {
    nombre: 'VERIFICADO',
    descripcion: 'Foto tomada cerca de la obra (~30m)',
    exifGps: { lat: -17.9665, lng: -67.1165 }, // ~30m de la obra
    browserGps: { lat: -17.9665, lng: -67.1165 }, // GPS navegador coincide con EXIF
    filename: 'foto_verificada.jpg',
    avance: {
      avanceFisicoParcial: 5,
      avanceFisicoAcumulado: 60,
      avanceFinancieroParcial: 4,
      avanceFinancieroAcumulado: 58,
      hitoDescripcion: 'Estructura de hormigón completada en 80%',
      actividadesRealizadas: 'Vaciado de losa del segundo piso, instalación de armaduras y encofrado',
      problemasIdentificados: 'Ninguno',
      clima: 'SOLEADO',
    },
  },
  {
    nombre: 'SOSPECHOSO',
    descripcion: 'Foto tomada lejos de la obra (~5km)',
    exifGps: { lat: -17.9200, lng: -67.0800 }, // ~5.2km de la obra
    browserGps: { lat: -17.9200, lng: -67.0800 }, // GPS navegador coincide con EXIF pero lejos
    filename: 'foto_sospechosa.jpg',
    avance: {
      avanceFisicoParcial: 3,
      avanceFisicoAcumulado: 63,
      avanceFinancieroParcial: 2,
      avanceFinancieroAcumulado: 60,
      hitoDescripcion: 'Instalaciones eléctricas en proceso',
      actividadesRealizadas: 'Tendido de cableado eléctrico en ambientes del primer piso',
      problemasIdentificados: 'Retraso por falta de material eléctrico',
      clima: 'NUBLADO',
    },
  },
  {
    nombre: 'SOSPECHOSO (Sin GPS)',
    descripcion: 'Foto sin coordenadas GPS en EXIF',
    exifGps: null, // Sin GPS
    browserGps: { lat: -17.9667, lng: -67.1167 }, // GPS navegador en la obra
    filename: 'foto_sin_gps.jpg',
    avance: {
      avanceFisicoParcial: 2,
      avanceFisicoAcumulado: 65,
      avanceFinancieroParcial: 3,
      avanceFinancieroAcumulado: 63,
      hitoDescripcion: 'Instalaciones sanitarias',
      actividadesRealizadas: 'Instalación de tuberías de desagüe en baños del segundo piso',
      problemasIdentificados: 'Falta de tuberías de 4 pulgadas',
      clima: 'LLUVIA',
    },
  },
];

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

function log(title, data) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('═'.repeat(60));
  if (data) console.log(data);
}

function logSection(title) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('─'.repeat(60));
}

function logResult(label, value, color = '') {
  console.log(`  ${label}: ${value}`);
}

// ============================================================
// GENERACIÓN DE IMÁGENES JPEG CON EXIF
// ============================================================

function createMinimalJPEG() {
  // Crear un JPEG mínimo válido (1x1 pixel rojo)
  // Este es un JPEG base64 mínimo que podemos modificar
  const jpegBase64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==';
  return Buffer.from(jpegBase64, 'base64');
}

function generateImageWithEXIF(scenario) {
  const jpegBytes = createMinimalJPEG();
  
  // Convertir buffer a string para piexifjs
  const jpegData = jpegBytes.toString('binary');
  
  // Crear estructura EXIF con GPS si corresponde
  const exifObj = {
    '0th': {},
    'Exif': {},
    'GPS': {},
    '1st': {},
    'thumbnail': null,
  };

  // Datos generales EXIF
  exifObj['0th'][piexif.ImageIFD.Make] = 'Samsung';
  exifObj['0th'][piexif.ImageIFD.Model] = 'SM-G991B';
  exifObj['0th'][piexif.ImageIFD.Software] = 'G991BXXS5AWK1';
  exifObj['0th'][piexif.ImageIFD.DateTime] = '2025:05:18 14:30:00';
  
  exifObj['Exif'][piexif.ExifIFD.DateTimeOriginal] = '2025:05:18 14:30:00';
  exifObj['Exif'][piexif.ExifIFD.DateTimeDigitized] = '2025:05:18 14:30:00';
  exifObj['Exif'][piexif.ExifIFD.ExposureTime] = [1, 120];
  exifObj['Exif'][piexif.ExifIFD.FNumber] = [18, 10];
  exifObj['Exif'][piexif.ExifIFD.ISOSpeedRatings] = 100;

  // GPS si corresponde
  if (scenario.exifGps) {
    const lat = scenario.exifGps.lat;
    const lng = scenario.exifGps.lng;
    
    exifObj['GPS'][piexif.GPSIFD.GPSVersionID] = [2, 3, 0, 0];
    exifObj['GPS'][piexif.GPSIFD.GPSLatitudeRef] = lat >= 0 ? 'N' : 'S';
    exifObj['GPS'][piexif.GPSIFD.GPSLongitudeRef] = lng >= 0 ? 'E' : 'W';
    
    // Convertir coordenadas decimales a formato DMS (grados, minutos, segundos)
    const latDMS = decimalToDMS(Math.abs(lat));
    const lngDMS = decimalToDMS(Math.abs(lng));
    
    exifObj['GPS'][piexif.GPSIFD.GPSLatitude] = [
      [latDMS.degrees, 1], [latDMS.minutes, 1], [Math.round(latDMS.seconds * 1000), 1000]
    ];
    exifObj['GPS'][piexif.GPSIFD.GPSLongitude] = [
      [lngDMS.degrees, 1], [lngDMS.minutes, 1], [Math.round(lngDMS.seconds * 1000), 1000]
    ];
    exifObj['GPS'][piexif.GPSIFD.GPSAltitudeRef] = 0;
    exifObj['GPS'][piexif.GPSIFD.GPSAltitude] = [3700, 1]; // ~3700m (Oruro)
  }

  // Insertar EXIF en la imagen
  const exifBytes = piexif.dump(exifObj);
  const newJpegData = piexif.insert(exifBytes, jpegData);
  
  // Convertir de vuelta a buffer
  return Buffer.from(newJpegData, 'binary');
}

function decimalToDMS(decimal) {
  const degrees = Math.floor(decimal);
  const minutesFloat = (decimal - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = (minutesFloat - minutes) * 60;
  return { degrees, minutes, seconds };
}

// ============================================================
// AUTENTICACIÓN
// ============================================================

function generateTestToken() {
  // Generar JWT con rol INSPECTOR para simular usuario autenticado
  // Usamos un ID de usuario existente en la base de datos
  const payload = { id: '6a0ab8da6fdc5bda2feff086', rol: 'INSPECTOR' };
  return jwt.sign(payload, process.env.JWT_SECRET || 'sdop-jwt-secret', { expiresIn: '1d' });
}

// ============================================================
// SUBIDA DE FOTOS
// ============================================================

async function uploadPhoto(token, scenario) {
  const filePath = path.join(IMAGES_DIR, scenario.filename);
  
  // Generar imagen con EXIF
  const imageBuffer = generateImageWithEXIF(scenario);
  fs.writeFileSync(filePath, imageBuffer);
  
  console.log(`  📸 Imagen generada: ${scenario.filename}`);
  console.log(`     EXIF GPS: ${scenario.exifGps ? `${scenario.exifGps.lat}, ${scenario.exifGps.lng}` : 'NO DISPONIBLE'}`);
  console.log(`     Browser GPS: ${scenario.browserGps.lat}, ${scenario.browserGps.lng}`);

  // Preparar FormData
  const FormData = (await import('form-data')).default;
  const formData = new FormData();
  formData.append('foto', imageBuffer, {
    filename: scenario.filename,
    contentType: 'image/jpeg',
  });
  formData.append('categoria', 'VISTA_GENERAL');
  formData.append('descripcion', scenario.descripcion);
  formData.append('browserGpsLat', scenario.browserGps.lat.toString());
  formData.append('browserGpsLng', scenario.browserGps.lng.toString());
  formData.append('proyectoCoords', JSON.stringify(PROYECTO.coordenadas));

  // Subir al backend
  const response = await axios.post(`${API_URL}/avances/upload`, formData, {
    headers: {
      ...formData.getHeaders(),
      Authorization: `Bearer ${token}`,
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return response.data.data;
}

// ============================================================
// CREAR AVANCE DE OBRA
// ============================================================

async function createAvance(token, fotos, avanceData) {
  const response = await axios.post(`${API_URL}/avances`, {
    proyectoId: PROYECTO.id,
    ...avanceData,
    fotos: fotos.map(f => ({
      url: f.url,
      publicId: f.publicId,
      exif: f.exif,
      verificacion: f.verificacion,
      categoria: f.categoria,
      descripcion: f.descripcion,
    })),
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data.data;
}

// ============================================================
// CALCULAR DISTANCIA HAVERSINE
// ============================================================

function haversineDistance(coord1, coord2) {
  const R = 6371e3;
  const φ1 = (coord1.lat * Math.PI) / 180;
  const φ2 = (coord2.lat * Math.PI) / 180;
  const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const Δλ = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// ============================================================
// EJECUCIÓN PRINCIPAL
// ============================================================

async function main() {
  console.clear();
  
  log('SIMULACIÓN DE SUBIDA DE FOTOGRAFÍA CON EXIF Y GEOVERIFICACIÓN', `
  Proyecto: ${PROYECTO.nombre}
  Código: ${PROYECTO.codigoInterno}
  Coordenadas obra: ${PROYECTO.coordenadas.lat}, ${PROYECTO.coordenadas.lng}
  Avance físico actual: ${PROYECTO.avanceFisicoActual}%
  API: ${API_URL}
  `);

  // Generar token de autenticación
  const token = generateTestToken();
  logSection('🔐 Token JWT generado');
  console.log(`  Token: ${token.substring(0, 50)}...`);
  console.log(`  Rol: INSPECTOR`);

  // Procesar cada escenario
  const resultados = [];

  for (const escenario of ESCENARIOS) {
    logSection(`📷 ESCENARIO: ${escenario.nombre} - ${escenario.descripcion}`);

    try {
      // 1. Subir foto
      console.log('\n  ⬆️ Subiendo foto al backend...');
      const fotoData = await uploadPhoto(token, escenario);

      // 2. Mostrar resultados de verificación
      console.log('\n  📋 RESULTADO DE VERIFICACIÓN:');
      console.log(`  ┌─────────────────────────────────────────────┐`);
      console.log(`  │ Estado: ${fotoData.verificacion.estado.padEnd(32)}│`);
      console.log(`  │ Distancia a obra: ${String(fotoData.verificacion.distanciaObraMetros || 'N/A').padEnd(20)}m │`);
      console.log(`  │ Radio aceptado: ${String(fotoData.verificacion.radioAceptadoMetros).padEnd(20)}m │`);
      console.log(`  │ Ubicación válida: ${String(fotoData.verificacion.ubicacionValida).padEnd(18)} │`);
      console.log(`  │ Metadata consistente: ${String(fotoData.verificacion.metadataConsistente).padEnd(14)} │`);
      console.log(`  │ EXIF disponible: ${String(fotoData.verificacion.exifDisponible).padEnd(19)} │`);
      console.log(`  │ Observaciones: ${fotoData.verificacion.observaciones.substring(0, 28).padEnd(28)} │`);
      console.log(`  └─────────────────────────────────────────────┘`);

      // 3. Mostrar EXIF extraído
      if (fotoData.exif) {
        console.log('\n  📝 EXIF EXTRAÍDO:');
        console.log(`  Dispositivo: ${fotoData.exif.dispositivo || 'N/A'}`);
        console.log(`  Modelo: ${fotoData.exif.modeloCamara || 'N/A'}`);
        console.log(`  GPS: ${fotoData.exif.latitud ? `${fotoData.exif.latitud.toFixed(6)}, ${fotoData.exif.longitud.toFixed(6)}` : 'No disponible'}`);
        console.log(`  Tiene GPS: ${fotoData.exif.tieneGPS}`);
      }

      // 4. Crear avance de obra
      console.log('\n  📝 Creando avance de obra...');
      const avance = await createAvance(token, [fotoData], escenario.avance);

      console.log(`  ✅ Avance creado: ${avance.numeroReporte}`);
      console.log(`     Estado: ${avance.estado}`);
      console.log(`     Avance físico acumulado: ${avance.avanceFisicoAcumulado}%`);

      resultados.push({
        escenario: escenario.nombre,
        foto: fotoData,
        avance,
        distanciaCalculada: escenario.exifGps 
          ? Math.round(haversineDistance(escenario.exifGps, PROYECTO.coordenadas))
          : 'N/A',
      });

    } catch (error) {
      console.error(`  ❌ Error en escenario ${escenario.nombre}:`, error.response?.data || error.message);
      resultados.push({
        escenario: escenario.nombre,
        error: error.response?.data || error.message,
      });
    }
  }

  // ============================================================
  // RESUMEN FINAL
  // ============================================================

  log('RESUMEN DE SIMULACIÓN');

  console.log('\n  ┌─────────────────┬──────────────┬──────────────┬──────────────────┐');
  console.log('  │ Escenario       │ Estado       │ Dist. (m)    │ Avance Reporte   │');
  console.log('  ├─────────────────┼──────────────┼──────────────┼──────────────────┤');

  for (const r of resultados) {
    const estado = r.foto?.verificacion?.estado || 'ERROR';
    const distancia = r.distanciaCalculada || 'N/A';
    const reporte = r.avance?.numeroReporte || 'N/A';
    console.log(`  │ ${r.escenario.padEnd(15)} │ ${estado.padEnd(12)} │ ${String(distancia).padEnd(12)} │ ${reporte.padEnd(16)} │`);
  }

  console.log('  └─────────────────┴──────────────┴──────────────┴──────────────────┘');

  // Detalles por escenario
  logSection('DETALLE POR ESCENARIO');

  for (const r of resultados) {
    console.log(`\n  📌 ${r.escenario}:`);
    if (r.error) {
      console.log(`     Error: ${r.error.message || r.error}`);
      continue;
    }
    console.log(`     Foto URL: ${r.foto.url}`);
    console.log(`     EXIF GPS inyectado: ${r.foto.exif?.latitud ? `${r.foto.exif.latitud.toFixed(6)}, ${r.foto.exif.longitud.toFixed(6)}` : 'No disponible'}`);
    console.log(`     Distancia calculada: ${r.distanciaCalculada}m`);
    console.log(`     Estado verificación: ${r.foto.verificacion.estado}`);
    console.log(`     Avance ID: ${r.avance._id}`);
    console.log(`     Reporte: ${r.avance.numeroReporte}`);
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log('  ✅ SIMULACIÓN COMPLETADA');
  console.log(`  📁 Imágenes generadas en: ${IMAGES_DIR}`);
  console.log(`  📊 3 avances creados en la base de datos`);
  console.log('═'.repeat(60));
  console.log('');
}

main().catch(console.error);
