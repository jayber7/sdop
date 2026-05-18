const exifr = require('exifr');

const extractExifMiddleware = async (req, res, next) => {
  try {
    if (!req.file || !req.file.path) {
      return next();
    }

    const exif = await exifr.parse(req.file.path);

    if (exif) {
      req.exifData = {
        latitud: exif.latitude || null,
        longitud: exif.longitude || null,
        altitud: exif.altitude || null,
        fechaCaptura: exif.DateTimeOriginal || exif.CreateDate || null,
        horaCaptura: exif.DateTimeOriginal ? exif.DateTimeOriginal.toTimeString().split(' ')[0] : null,
        dispositivo: exif.Make || null,
        modeloCamara: exif.Model || null,
        software: exif.Software || null,
        orientacion: exif.Orientation === 1 ? 'landscape' : 'portrait',
        resolucion: {
          width: exif.ExifImageWidth || exif.ImageWidth || null,
          height: exif.ExifImageHeight || exif.ImageHeight || null,
        },
        tieneGPS: !!(exif.latitude && exif.longitude),
      };
    }

    next();
  } catch (error) {
    console.error('Error extracting EXIF:', error.message);
    next();
  }
};

module.exports = extractExifMiddleware;
