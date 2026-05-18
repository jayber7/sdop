function haversineDistance(coord1, coord2) {
  const R = 6371e3;
  const φ1 = (coord1.lat * Math.PI) / 180;
  const φ2 = (coord2.lat * Math.PI) / 180;
  const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const Δλ = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const geoVerificationMiddleware = (req, res, next) => {
  try {
    const { browserGpsLat, browserGpsLng, proyectoCoords, radioAceptado = 500 } = req.body;

    // Parsear proyectoCoords si viene como string JSON
    let coordsParsed;
    try {
      coordsParsed = typeof proyectoCoords === 'string' ? JSON.parse(proyectoCoords) : proyectoCoords;
    } catch (e) {
      coordsParsed = proyectoCoords;
    }

    if (!browserGpsLat || !browserGpsLng || !coordsParsed) {
      req.verificacion = {
        ubicacionValida: false,
        fechaValida: true,
        distanciaObraMetros: null,
        radioAceptadoMetros: radioAceptado,
        metadataConsistente: false,
        estado: 'SOSPECHOSO',
        observaciones: 'Datos de ubicación incompletos',
      };
      return next();
    }

    const browserGps = { lat: parseFloat(browserGpsLat), lng: parseFloat(browserGpsLng) };
    const proyecto = { lat: parseFloat(coordsParsed.lat), lng: parseFloat(coordsParsed.lng) };

    const distancia = haversineDistance(browserGps, proyecto);

    const exifGps = req.exifData?.latitud && req.exifData?.longitud
      ? { lat: req.exifData.latitud, lng: req.exifData.longitud }
      : null;

    let distanciaExifBrowser = null;
    let coinciden = true;

    if (exifGps) {
      distanciaExifBrowser = haversineDistance(exifGps, browserGps);
      coinciden = distanciaExifBrowser < 100;
    }

    let estado = 'VERIFICADO';
    let observaciones = '';

    if (distancia > radioAceptado) {
      estado = 'SOSPECHOSO';
      observaciones = `Fuera del radio de ${radioAceptado}m (distancia: ${Math.round(distancia)}m)`;
    }

    if (exifGps && !coinciden) {
      estado = 'SOSPECHOSO';
      observaciones += ` | EXIF y GPS navegador no coinciden (${Math.round(distanciaExifBrowser)}m)`;
    }

    if (!exifGps && !browserGpsLat) {
      estado = 'SOSPECHOSO';
      observaciones = 'Sin datos de geolocalización en la foto';
    }

    req.verificacion = {
      ubicacionValida: distancia <= radioAceptado,
      fechaValida: true,
      distanciaObraMetros: Math.round(distancia),
      radioAceptadoMetros: radioAceptado,
      metadataConsistente: coinciden,
      distanciaExifBrowserMetros: distanciaExifBrowser ? Math.round(distanciaExifBrowser) : null,
      exifDisponible: !!exifGps,
      estado,
      observaciones: observaciones || 'Verificación exitosa',
    };

    next();
  } catch (error) {
    console.error('Error en verificación geográfica:', error.message);
    req.verificacion = {
      ubicacionValida: false,
      fechaValida: false,
      distanciaObraMetros: null,
      estado: 'SOSPECHOSO',
      observaciones: 'Error en verificación',
    };
    next();
  }
};

module.exports = geoVerificationMiddleware;
