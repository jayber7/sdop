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

    // --- Nueva lógica: EXIF como fuente PRIMARIA, browser como FALLBACK ---
    let estado = 'SOSPECHOSO';
    let observaciones = '';
    let distanciaExifObra = null;

    if (exifGps) {
      // Fuente primaria: GPS de la foto (EXIF)
      distanciaExifObra = haversineDistance(exifGps, proyecto);
      if (distanciaExifObra <= radioAceptado) {
        estado = 'VERIFICADO';
        observaciones = `GPS de la fotografía dentro del radio de ${radioAceptado}m (distancia: ${Math.round(distanciaExifObra)}m)`;
      } else {
        estado = 'SOSPECHOSO';
        observaciones = `GPS de la fotografía fuera del radio de ${radioAceptado}m (distancia: ${Math.round(distanciaExifObra)}m)`;
      }
    } else if (browserGpsLat && browserGpsLng) {
      // Sin EXIF: usar GPS del navegador como fallback
      if (distancia <= radioAceptado) {
        estado = 'VERIFICADO';
        observaciones = `GPS del navegador dentro del radio de ${radioAceptado}m (distancia: ${Math.round(distancia)}m)`;
      } else {
        estado = 'SOSPECHOSO';
        observaciones = `GPS del navegador fuera del radio de ${radioAceptado}m (distancia: ${Math.round(distancia)}m)`;
      }
    } else {
      estado = 'SOSPECHOSO';
      observaciones = 'Sin datos de geolocalización en la foto ni en el navegador';
    }

    req.verificacion = {
      ubicacionValida: estado === 'VERIFICADO',
      fechaValida: true,
      distanciaObraMetros: exifGps ? Math.round(distanciaExifObra) : Math.round(distancia),
      radioAceptadoMetros: radioAceptado,
      metadataConsistente: true,
      distanciaExifBrowserMetros: distanciaExifBrowser ? Math.round(distanciaExifBrowser) : null,
      distanciaExifObraMetros: distanciaExifObra ? Math.round(distanciaExifObra) : null,
      exifDisponible: !!exifGps,
      estado,
      observaciones,
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
