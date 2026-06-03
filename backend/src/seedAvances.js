/**
 * Script para sembrar avances de obra con fotos de prueba
 * Ejecutar: node src/seedAvances.js
 * Requiere datos existentes (proyectos, usuarios) sembrados con seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Proyecto = require('./models/Proyecto');
const Usuario = require('./models/Usuario');
const AvanceObra = require('./models/AvanceObra');
const Counter = require('./models/Counter');

// Rango GPS Oruro, Bolivia
const ORURO_LAT_MIN = -19.5;
const ORURO_LAT_MAX = -17.5;
const ORURO_LNG_MIN = -68.5;
const ORURO_LNG_MAX = -66.5;

const CLIMAS = ['SOLEADO', 'NUBLADO', 'LLUVIA', 'GRANIZO', 'NIEBLA'];
const CATEGORIAS_FOTO = ['VISTA_GENERAL', 'DETALLE_CONSTRUCCION', 'MATERIAL', 'EQUIPO', 'PERSONAL', 'ANTES', 'DESPUES'];
const DISPOSITIVOS = [
  'iPhone 14 Pro', 'Xiaomi Redmi Note 12', 'Samsung Galaxy S24',
  'Motorola Edge 50', 'Huawei P60 Pro', 'Xiaomi 14T',
];
const ESTADOS = ['BORRADOR', 'ENVIADO', 'APROBADO', 'OBSERVADO'];

const ACTIVIDADES_POR_TIPO = {
  CAMINO: [
    'Movimiento de tierras en tramo 1, avance lineal 200m. Se realizó corte y relleno con maquinaria pesada.',
    'Compactación de base granular en sector A. Se utilizó rodillo vibrador, espesor 20cm.',
    'Colocación de capa asfáltica en caliente en calzada izquierda, temperatura controlada 150°C.',
    'Construcción de cunetas y obras de drenaje lateral. Se excavaron 150m lineales.',
    'Señalización horizontal y vertical en tramo completado. Instalación de 12 señales.',
    'Obras de protección con gaviones en talud derecho, altura 3m.',
    'Base granular en sector B, avance 80% del tramo. Ensayos de densidad in-situ.',
    'Imprimación asfáltica en 500m de calzada, rendimiento 1.2 lt/m².',
    'Bacheo y reparaciones en sector crítico, con fresado previo de 5cm.',
    'Colocación de bordillos y aceras peatonales en zona urbana.',
  ],
  PUENTE: [
    'Excavación para zapatas de estribo izquierdo, profundidad 4m. Se encontró estrato rocoso.',
    'Armado de acero estructural para losa de aproximación, diámetro 1\".',
    'Vaciado de concreto para pila central, volumen 120m³, resistencia 280kg/cm².',
    'Montaje de vigas prefabricadas tipo AASHTO, 4 vigas de 25m c/u.',
    'Instalación de barandas metálicas y juntas de dilatación.',
    'Prueba de carga estática con 4 camiones de 25tn. Deformación máxima 8mm.',
    'Encofrado de losa superior, área 300m². Se utilizó encofrado metálico.',
    'Construcción de accesos y muros de contención en ambos estribos.',
    'Colocación de carpeta asfáltica en tablero y accesos.',
    'Impermeabilización de junta de dilatación con membrana asfáltica.',
  ],
  ELECTRIFICACION: [
    'Instalación de postes de hormigón centrifugado, 12m altura, 40 postes colocados.',
    'Tendido de conductor de media tensión 24.9kV en 1.5km, utilizando poleas y tensores.',
    'Montaje de transformador trifásico 100kVA en subestación rural.',
    'Instalación de acometidas domiciliarias, 25 conexiones realizadas.',
    'Excavación y hormigonado de bases para postes, dimensión 1x1x1.5m.',
    'Colocación de retenidas y tensores en postes de esquina y final de línea.',
    'Prueba de aislamiento con megóhmetro, valores superiores a 1000 MΩ.',
    'Instalación de medidores inteligentes en 30 viviendas del municipio.',
    'Poda y desbroce de franja de seguridad, ancho 6m, longitud 2km.',
    'Puesta en servicio de línea secundaria, energización exitosa.',
  ],
  AGUA_POTABLE: [
    'Excavación de zanja para tubería principal, profundidad 1.5m, avance 200m/día.',
    'Instalación de tubería PVC DN 160mm, con unión elástica, 150m instalados.',
    'Construcción de cámara de válvulas de compuerta, dimensión 1.2x1.2m.',
    'Prueba hidráulica a 100m de tubería, presión 1.5 MPa sin fugas.',
    'Instalación de hidrantes contra incendio en esquinas del casco urbano.',
    'Construcción de tanque de almacenamiento elevado, capacidad 250m³.',
    'Conexiones domiciliarias de agua potable, 35 nuevas conexiones.',
    'Instalación de medidores de caudal tipo Woltman en línea principal.',
    'Desinfección de tubería con cloro, concentración 50mg/L, tiempo de contacto 24h.',
    'Relleno compactado de zanja en capas de 20cm con compactador manual.',
  ],
  SANEAMIENTO: [
    'Construcción de muro de gaviones para control de erosión, altura 2m.',
    'Limpieza y desbroce del cauce del río en 500m lineales.',
    'Colocación de enrocado de protección en margen izquierda, volumen 300m³.',
    'Construcción de disipadores de energía en salida de alcantarilla.',
    'Revegetación de taludes con especies nativas, 200m² plantados.',
    'Instalación de tubería de alcantarillado sanitario DN 200mm, 120m.',
    'Construcción de cámara de inspección, profundidad 2.5m, ladrillo cerámico.',
    'Control de maleza acuática en canal principal, 3km tratados.',
    'Construcción de canal de coronación en ladera, sección trapezoidal.',
    'Monitoreo de calidad de agua, toma de muestras en 5 puntos del río.',
  ],
  EDIFICACION: [
    'Vaciado de losa de entrepiso, área 200m², espesor 15cm, concreto premezclado.',
    'Colocación de bloques de ladrillo cerámico en muros perimetrales, avance 60%.',
    'Instalación eléctrica en primer piso, tubería EMT y cable THHN.',
    'Enchape de baños con cerámica nacional, formato 40x40cm, color gris.',
    'Instalación de ventanas de aluminio con sistema de corredera.',
    'Aplicación de estuco y pintura en muros interiores, color blanco hueso.',
    'Colocación de cielo raso con planchas de PVC en aulas.',
    'Construcción de rampa de acceso para discapacitados, pendiente 8%.',
    'Instalación sanitaria con tubería PVC, conexión a red municipal.',
    'Colocación de piso porcelanato en áreas administrativas.',
  ],
  OTRO: [
    'Trabajos preliminares: replanteo y nivelación del terreno.',
    'Movimiento de tierras: excavación masiva con retroexcavadora.',
    'Compactación del terreno con rodillo liso vibratorio.',
    'Construcción de plataforma de trabajo con material de préstamo.',
    'Instalación de cerco perimetral provisional con malla olímpica.',
    'Obras de drenaje temporal: cunetas y zanjas de coronación.',
    'Acondicionamiento de accesos y vías internas.',
    'Instalación de faenas: campamento, almacén y baños químicos.',
    'Señalización de obra y medidas de seguridad industrial.',
    'Limpieza final y entrega de obra.',
  ],
};

const PROBLEMAS = [
  'Retraso en la llegada de materiales por lluvias en la carretera.',
  'Presencia de roca dura no prevista en el estudio de suelos.',
  'Paro de transportistas que afectó el suministro de agregados.',
  'Filtraciones de agua subterránea en la excavación.',
  'Dificultad en la compactación por alto contenido de humedad.',
  'Equipo de compactación fuera de servicio por mantenimiento.',
  'Variación de temperatura que afectó el fraguado del concreto.',
  'Presencia de cableado eléctrico no registrado en la zona.',
  'Demora en la aprobación del diseño por parte del supervisor.',
  'Condiciones climáticas adversas que redujeron el rendimiento.',
  null,
];

const HITO_DESCRIPCIONES = [
  'Avance de obra programado - hito mensual',
  'Cumplimiento de meta física mensual',
  'Avance financiero correspondiente al periodo',
  'Hito de control trimestral de obra',
  'Reporte de avance físico-financiero',
  'Hito de certificación de obra ejecutada',
  'Control de calidad y avance de obra',
  'Verificación de cumplimiento de especificaciones',
];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max, decimals = 6) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function pick(arr) {
  return arr[rand(0, arr.length - 1)];
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Generar GPS cercano al proyecto (dentro de radio ~100-400m)
function gpsCercano(lat, lng) {
  const offsetLat = randFloat(-0.003, 0.003, 6); // ~±330m
  const offsetLng = randFloat(-0.003, 0.003, 6);
  return { lat: lat + offsetLat, lng: lng + offsetLng };
}

// Generar GPS lejano (>1km)
function gpsLejano(lat, lng) {
  let nlat, nlng, dist;
  do {
    nlat = lat + randFloat(-0.03, 0.03, 6);
    nlng = lng + randFloat(-0.03, 0.03, 6);
    dist = haversine(lat, lng, nlat, nlng);
  } while (dist < 1000);
  return { lat: nlat, lng: nlng, dist };
}

// GPS aleatorio en Oruro
function gpsOruro() {
  return {
    lat: randFloat(ORURO_LAT_MIN, ORURO_LAT_MAX, 6),
    lng: randFloat(ORURO_LNG_MIN, ORURO_LNG_MAX, 6),
  };
}

function generarFotos(proyectoLat, proyectoLng, cantidad, reportDate, avanceIndex, fotoIndexStart) {
  const fotos = [];
  for (let i = 0; i < cantidad; i++) {
    const fotoIdx = fotoIndexStart + i;
    // ~60% cerca, ~30% lejos, ~10% sin GPS
    const tipoGps = Math.random();
    let exifLat, exifLng, tieneGPS, distancia, ubicacionValida;

    if (tipoGps < 0.6) {
      // Cercano → VERIFICADO
      const near = gpsCercano(proyectoLat, proyectoLng);
      exifLat = near.lat;
      exifLng = near.lng;
      tieneGPS = true;
      distancia = haversine(proyectoLat, proyectoLng, exifLat, exifLng);
      ubicacionValida = distancia < 500;
    } else if (tipoGps < 0.9) {
      // Lejano → SOSPECHOSO
      const far = gpsLejano(proyectoLat, proyectoLng);
      exifLat = far.lat;
      exifLng = far.lng;
      tieneGPS = true;
      distancia = far.dist;
      ubicacionValida = false;
    } else {
      // Sin GPS
      exifLat = null;
      exifLng = null;
      tieneGPS = false;
      distancia = null;
      ubicacionValida = false;
    }

    const estadoVerif = ubicacionValida ? 'VERIFICADO' : 'SOSPECHOSO';
    const seed = `avance-seed-${avanceIndex}-${i}`;
    const capturaDate = new Date(reportDate);
    capturaDate.setUTCHours(rand(7, 17), rand(0, 59), rand(0, 59));
    const dispositivo = pick(DISPOSITIVOS);

    fotos.push({
      url: `https://picsum.photos/seed/${seed}/800/600`,
      publicId: `sdop/avances/seed/${seed}`,
      exif: {
        latitud: exifLat,
        longitud: exifLng,
        altitud: randFloat(3650, 3850, 1),
        fechaCaptura: capturaDate,
        horaCaptura: capturaDate.toTimeString().slice(0, 8),
        dispositivo,
        modeloCamara: dispositivo,
        software: pick(['PicSay 3.2', 'Adobe Lightroom', null, null, null]),
        orientacion: pick(['Horizontal (normal)', 'Horizontal (normal)', 'Horizontal (normal)', 'Rotada 90° CW']),
        resolucion: { width: 4032, height: 3024 },
        tieneGPS,
      },
      verificacion: {
        ubicacionValida,
        fechaValida: true,
        distanciaObraMetros: distancia,
        radioAceptadoMetros: 500,
        metadataConsistente: tieneGPS && ubicacionValida,
        estado: estadoVerif,
      },
      categoria: pick(CATEGORIAS_FOTO),
      descripcion: pick([
        'Foto de registro de avance de obra',
        'Evidencia fotográfica del hito',
        'Registro visual del progreso',
        'Documentación de obra ejecutada',
      ]),
    });
  }
  return fotos;
}

async function seedAvances() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sdop_gestion';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    // Cargar proyectos y usuarios
    const proyectos = await Proyecto.find({}).lean();
    const usuarios = await Usuario.find({}).lean();
    console.log(`📦 ${proyectos.length} proyectos, ${usuarios.length} usuarios encontrados`);

    if (proyectos.length === 0) {
      console.log('❌ No hay proyectos. Ejecuta primero: npm run seed');
      process.exit(1);
    }

    const adminUser = usuarios.find((u) => u.rol === 'ADMIN') || usuarios[0];
    const supervisorUser = usuarios.find((u) => u.rol === 'SUPERVISOR') || adminUser;
    const inspectorUser = usuarios.find((u) => u.rol === 'INSPECTOR') || adminUser;
    const fiscalUser = usuarios.find((u) => u.rol === 'FISCAL') || adminUser;

    let totalAvances = 0;
    let totalFotos = 0;

    for (let pi = 0; pi < proyectos.length; pi++) {
      const proyecto = proyectos[pi];
      const numAvances = rand(1, 10);

      // Asignar GPS al proyecto si no tiene
      if (!proyecto.coordenadas || !proyecto.coordenadas.lat || !proyecto.coordenadas.lng) {
        const gps = gpsOruro();
        await Proyecto.findByIdAndUpdate(proyecto._id, {
          coordenadas: { lat: gps.lat, lng: gps.lng },
        });
        proyecto.coordenadas = gps;
      }

      const proyLat = proyecto.coordenadas.lat;
      const proyLng = proyecto.coordenadas.lng;

      const codigoPart = String(proyecto.codigoInterno).replace(/\s+/g, '').slice(-8).padStart(8, '0');
      const tipo = proyecto.tipo || 'OTRO';
      const actividades = ACTIVIDADES_POR_TIPO[tipo] || ACTIVIDADES_POR_TIPO.OTRO;

      // Fecha base: iniciar en enero 2025
      const fechaBase = new Date('2025-01-15');
      const reportes = [];

      let fotoGlobalIndex = pi * 1000;

      for (let ai = 0; ai < numAvances; ai++) {
        const seq = ai + 1;
        const yearStr = String(2025 + Math.floor(ai / 6));
        const numeroReporte = `AV-${yearStr}-${codigoPart}-${String(seq).padStart(3, '0')}`;

        const fechaReporte = new Date(fechaBase);
        fechaReporte.setDate(fechaBase.getDate() + ai * rand(15, 45) + rand(0, 10));
        if (fechaReporte > new Date()) fechaReporte.setTime(Date.now() - rand(0, 30) * 86400000);

        // Estado con distribución realista
        let estado;
        const r = Math.random();
        if (r < 0.4) estado = 'APROBADO';
        else if (r < 0.65) estado = 'ENVIADO';
        else if (r < 0.85) estado = 'BORRADOR';
        else estado = 'OBSERVADO';

        // Avance acumulado: incrementa con cada reporte (máx 55%)
        const maxAcum = Math.min(55, seq * rand(4, 8));
        const avanceFisicoAcumulado = rand(1, Math.max(2, maxAcum));
        const avanceFisicoParcial = ai === 0 ? avanceFisicoAcumulado : rand(1, avanceFisicoAcumulado - (reportes[reportes.length - 1]?.avanceFisicoAcumulado || 0));
        const avanceFinancieroAcumulado = Math.max(1, Math.round(avanceFisicoAcumulado * randFloat(0.85, 0.98, 2)));
        const avanceFinancieroParcial = Math.max(1, Math.round(avanceFisicoAcumulado * randFloat(0.8, 0.95, 2)));

        // Fotos: 1-5
        const numFotos = rand(1, 5);
        const fotos = generarFotos(proyLat, proyLng, numFotos, fechaReporte, fotoGlobalIndex, 0);
        fotoGlobalIndex += numFotos;
        totalFotos += numFotos;

        // Usuario registrador
        const registrador = pick([adminUser, inspectorUser, fiscalUser, adminUser, inspectorUser]);

        // Datos del avance
        const avanceData = {
          proyectoId: proyecto._id,
          numeroReporte,
          fechaReporte,
          avanceFisicoParcial,
          avanceFisicoAcumulado,
          avanceFinancieroParcial,
          avanceFinancieroAcumulado,
          hitoDescripcion: pick(HITO_DESCRIPCIONES),
          actividadesRealizadas: pick(actividades),
          problemasIdentificados: pick(PROBLEMAS),
          clima: pick(CLIMAS),
          fotos,
          registradoPor: registrador._id,
          estado,
        };

        if (estado === 'APROBADO' || estado === 'OBSERVADO') {
          avanceData.aprobadoPor = pick([adminUser, supervisorUser])._id;
          avanceData.fechaAprobacion = new Date(fechaReporte.getTime() + rand(1, 5) * 86400000);
          if (estado === 'OBSERVADO') {
            avanceData.observacionesSupervisor = pick([
              'Se requiere mayor detalle en las fotografías de avance.',
              'El porcentaje de avance no coincide con la evidencia presentada.',
              'Faltan registros de control de calidad de los materiales.',
              'Las coordenadas de las fotos no corresponden a la ubicación del proyecto.',
              'Se necesita documentación adicional del hito reportado.',
            ]);
          }
        }

        if (estado === 'BORRADOR') {
          avanceData.estado = 'BORRADOR';
        }

        reportes.push(avanceData);
      }

      // Insertar avances
      const insertados = await AvanceObra.insertMany(reportes, { ordered: false });
      totalAvances += insertados.length;

      // Sincronizar contador para que futuros avances via API continúen la secuencia
      const key = `avance_${proyecto._id}`;
      await Counter.updateOne(
        { _id: key },
        { $set: { seq: numAvances } },
        { upsert: true }
      );

      console.log(`✅ Proyecto "${proyecto.nombre?.substring(0, 50)}..." → ${insertados.length} avances, ${reportes.reduce((s, r) => s + r.fotos.length, 0)} fotos`);
    }

    console.log(`\n🎯 Total sembrado: ${totalAvances} avances, ${totalFotos} fotos en ${proyectos.length} proyectos`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedAvances();
