import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, TextField, Grid, Chip, Alert, LinearProgress,
  Stack, IconButton, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  PhotoCamera, Upload, Delete, CheckCircle, Warning, Cancel,
  CameraAlt, GpsFixed, AccessTime, Smartphone, MyLocation, LocationOn, ErrorOutline,
} from '@mui/icons-material';
import exifr from 'exifr';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import VerificationReportLayout from '../components/VerificationReportLayout';

const glass = {
  card: {
    bgcolor: 'rgba(10,14,39,0.6)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(100,180,255,0.12)',
    borderRadius: 2,
    boxShadow: '0 4px 24px rgba(0,0,0,0.3), 0 0 20px rgba(0,150,255,0.03)',
  },
  input: {
    '& .MuiInputBase-root': {
      bgcolor: 'rgba(255,255,255,0.04)',
      color: 'rgba(255,255,255,0.85)',
      borderRadius: 1.5,
      '& fieldset': { border: '1px solid rgba(255,255,255,0.1)' },
      '&:hover fieldset': { borderColor: 'rgba(100,180,255,0.3) !important' },
      '&.Mui-focused fieldset': { borderColor: 'rgba(100,180,255,0.5) !important' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(150,200,255,0.5)', fontSize: '0.8rem' },
    '& .MuiInputLabel-root.Mui-focused': { color: 'rgba(100,200,255,0.7)' },
    '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.4)' },
    '& .MuiMenuItem-root': { fontSize: '0.8rem' },
  },
  chipVerificado: {
    bgcolor: 'rgba(0,200,150,0.15)',
    color: 'rgba(0,220,180,0.9)',
    border: '1px solid rgba(0,220,180,0.2)',
    fontWeight: 600,
  },
  chipSospechoso: {
    bgcolor: 'rgba(255,180,0,0.15)',
    color: 'rgba(255,200,0,0.9)',
    border: '1px solid rgba(255,200,0,0.2)',
    fontWeight: 600,
  },
  chipRechazado: {
    bgcolor: 'rgba(255,80,80,0.15)',
    color: 'rgba(255,100,100,0.9)',
    border: '1px solid rgba(255,80,80,0.2)',
    fontWeight: 600,
  },
  btnPrimary: {
    bgcolor: 'rgba(0,150,255,0.2)',
    color: 'rgba(150,220,255,0.95)',
    border: '1px solid rgba(0,150,255,0.3)',
    boxShadow: '0 0 20px rgba(0,150,255,0.1)',
    '&:hover': {
      bgcolor: 'rgba(0,150,255,0.35)',
      boxShadow: '0 0 30px rgba(0,150,255,0.2)',
    },
    '&.Mui-disabled': {
      bgcolor: 'rgba(255,255,255,0.05)',
      color: 'rgba(255,255,255,0.2)',
    },
  },
  btnOutline: {
    color: 'rgba(255,255,255,0.6)',
    border: '1px solid rgba(255,255,255,0.15)',
    '&:hover': {
      borderColor: 'rgba(255,255,255,0.3)',
      bgcolor: 'rgba(255,255,255,0.05)',
    },
  },
};

const fmtExifVal = (v) => {
  if (v == null) return '?';
  if (v instanceof Date) return v.toISOString().replace('T', ' ').split('.')[0];
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

function haversineDistance(coord1, coord2) {
  if (!coord1?.lat || !coord1?.lng || !coord2?.lat || !coord2?.lng) return null;
  const R = 6371e3;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const RegistrarAvance = () => {
  const { proyectoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const [proyecto, setProyecto] = useState(null);
  const [gps, setGps] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [formData, setFormData] = useState({
    avanceFisicoParcial: '1', avanceFisicoAcumulado: '1', avanceFinancieroParcial: '1',
    avanceFinancieroAcumulado: '1', hitoDescripcion: '', actividadesRealizadas: '',
    problemasIdentificados: '', clima: 'SOLEADO',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [gpsAlertOpen, setGpsAlertOpen] = useState(false);
  const [gpsAlertMessages, setGpsAlertMessages] = useState([]);
  const [gpsAlertPending, setGpsAlertPending] = useState(null);
  const [gpsAlertDists, setGpsAlertDists] = useState(null);
  const [rawExif, setRawExif] = useState(null);
  const [exifRawOpen, setExifRawOpen] = useState(false);

  useEffect(() => {
    if (!proyectoId) {
      navigate('/avances', { replace: true });
      return;
    }
    api.get(`/gestion/proyectos/${proyectoId}`).then((res) => setProyecto(res.data.data));
    getCurrentLocation();
  }, [proyectoId]);

  const getCurrentLocation = () => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError('Geolocalización no soportada');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setGps({
        lat: pos.coords.latitude, lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy, altitude: pos.coords.altitude,
      }),
      () => setGpsError('Se requiere acceso a ubicación para registrar avances'),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError(null);
    processFile(file);
  };

  const checkGpsValidity = (fotoData, exifData, distBrowser, distExif, radio) => {
    const messages = [];
    const exif = fotoData.exif;
    const umbral = radio || 500;

    // 1. EXIF sin GPS
    if (exif && exif.tieneGPS === false && exif.dispositivo) {
      messages.push('GPS no estaba activado al tomar la fotografía. Active la geolocalización en la cámara de su dispositivo.');
    } else if (exif && exif.tieneGPS === false && !exif.dispositivo) {
      messages.push('La imagen no contiene metadatos GPS. Es posible que haya sido editada, recortada o compartida sin datos originales.');
    } else if (!exif) {
      messages.push('No se pudieron extraer metadatos de la imagen. Verifique que el archivo sea una foto original.');
    }

    // 2. Sin GPS del navegador
    if (!gps && gpsError) {
      messages.push(`Permisos de ubicación no concedidos: ${gpsError}`);
    } else if (!gps && !gpsError) {
      messages.push('No se pudo obtener la ubicación del navegador. Asegúrese de tener conexión a internet.');
    }

    // 3. GPS Navegador vs Proyecto
    if (distBrowser != null && distBrowser > umbral) {
      messages.push(`GPS del Navegador no coincide con la ubicación del proyecto. Distancia: ${distBrowser}m (límite: ${umbral}m).`);
    }

    // 4. GPS Foto vs Proyecto
    if (distExif != null && distExif > umbral) {
      messages.push(`GPS de la Fotografía no coincide con la ubicación del proyecto. Distancia: ${distExif}m (límite: ${umbral}m).`);
    }

    return messages;
  };

  const processFile = async (file) => {
    setUploading(true);
    setUploadError(null);
    setGpsAlertMessages([]);
    setGpsAlertPending(null);
    try {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      let exifData = null;
      try {
        exifData = await exifr.parse(file, { gps: true });
      } catch (e) {}
      if (!exifData?.latitude) {
        try {
          exifData = await exifr.gps(file);
        } catch (e) {}
      }
      if (!exifData?.latitude) {
        try {
          const buffer = await file.arrayBuffer();
          const parsed = await exifr.parse(new Uint8Array(buffer), { gps: true, tiff: true, exif: true, makedata: true });
          if (parsed?.latitude) exifData = parsed;
        } catch (e) {}
      }

      // Normalizar desde formato exifr.gps() que usa timestamp
      if (exifData?.timestamp && !exifData.DateTimeOriginal) {
        exifData.DateTimeOriginal = new Date(exifData.timestamp);
      }

      const fd = new FormData();
      fd.append('foto', file);
      fd.append('categoria', 'VISTA_GENERAL');

      if (gps) {
        fd.append('browserGpsLat', gps.lat);
        fd.append('browserGpsLng', gps.lng);
      }

      if (proyecto?.coordenadas) {
        fd.append('proyectoCoords', JSON.stringify(proyecto.coordenadas));
      }

      setRawExif(exifData);
      setExifRawOpen(false);

      if (exifData) {
        if (exifData.latitude) fd.append('exifLat', exifData.latitude.toString());
        if (exifData.longitude) fd.append('exifLng', exifData.longitude.toString());
        if (exifData.altitude) fd.append('exifAlt', exifData.altitude.toString());
        if (exifData.DateTimeOriginal) {
          const d = new Date(exifData.DateTimeOriginal);
          if (!isNaN(d.getTime()) && d.getFullYear() >= 1000 && d.getFullYear() <= 9999)
            fd.append('exifDate', d.toISOString());
        }
        if (exifData.Make) fd.append('exifMake', exifData.Make);
        if (exifData.Model) fd.append('exifModel', exifData.Model);
      }

      const res = await api.post('/avances/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const fotoData = res.data.data;

      if (exifData) {
        fotoData.exif = {
          ...fotoData.exif,
          latitud: fotoData.exif?.latitud ?? (exifData.latitude ?? null),
          longitud: fotoData.exif?.longitud ?? (exifData.longitude ?? null),
          altitud: fotoData.exif?.altitud ?? (exifData.altitude ?? null),
          fechaCaptura: fotoData.exif?.fechaCaptura || (exifData.DateTimeOriginal ? new Date(exifData.DateTimeOriginal) : null),
          dispositivo: fotoData.exif?.dispositivo || exifData.Make || null,
          modeloCamara: fotoData.exif?.modeloCamara || exifData.Model || null,
          tieneGPS: fotoData.exif?.tieneGPS ?? !!(exifData.latitude && exifData.longitude),
        };
      }

      setFotos((prev) => [...prev, { ...fotoData, file, preview: url }]);

      // GPS validation after upload — compara ambas fuentes contra el proyecto
      const radio = fotoData.verificacion?.radioAceptadoMetros || 500;
      const coordProj = proyecto?.coordenadas?.lat && proyecto?.coordenadas?.lng
        ? { lat: proyecto.coordenadas.lat, lng: proyecto.coordenadas.lng } : null;
      const distBrowserCalc = gps && coordProj
        ? haversineDistance({ lat: gps.lat, lng: gps.lng }, coordProj) : null;
      const distExifCalc = exifData?.latitude && coordProj
        ? haversineDistance({ lat: exifData.latitude, lng: exifData.longitude }, coordProj) : null;
      const warnings = checkGpsValidity(fotoData, exifData, distBrowserCalc, distExifCalc, radio);
      if (warnings.length > 0) {
        setGpsAlertMessages(warnings);
        setGpsAlertDists({ distBrowser: distBrowserCalc, distExif: distExifCalc, radio });
        setGpsAlertPending(fotoData);
        setGpsAlertOpen(true);
      }
    } catch (error) {
      setUploadError(error.response?.data?.message || 'Error al subir la foto');
    } finally {
      setUploading(false);
      setPreviewUrl(null);
    }
  };

  const handleGpsAlertContinue = () => {
    setGpsAlertOpen(false);
    setGpsAlertPending(null);
    setGpsAlertDists(null);
  };

  const handleGpsAlertRetry = () => {
    setGpsAlertOpen(false);
    if (gpsAlertPending) {
      const idx = fotos.findIndex((f) => f.preview === gpsAlertPending.preview || f.url === gpsAlertPending.url);
      if (idx >= 0) {
        removeFoto(idx);
      }
    }
    setGpsAlertPending(null);
    setGpsAlertDists(null);
  };

  const removeFoto = (index) => {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.post('/avances', {
        proyectoId: proyectoId || proyecto?._id,
        ...formData,
        avanceFisicoParcial: parseFloat(formData.avanceFisicoParcial),
        avanceFisicoAcumulado: parseFloat(formData.avanceFisicoAcumulado),
        avanceFinancieroParcial: parseFloat(formData.avanceFinancieroParcial),
        avanceFinancieroAcumulado: parseFloat(formData.avanceFinancieroAcumulado),
        fotos: fotos.map((f) => ({
          url: f.url, publicId: f.publicId, exif: f.exif, verificacion: f.verificacion,
          categoria: f.categoria, descripcion: f.descripcion,
        })),
      });
      setSuccess(true);
      setTimeout(() => navigate(`/proyectos/${proyectoId || proyecto?._id}`), 2000);
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Error al registrar el avance');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-BO') + ' ' + d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
  };

  // === COMPUTED GPS DATA ===
  const coordProyecto = proyecto?.coordenadas?.lat && proyecto?.coordenadas?.lng
    ? { lat: proyecto.coordenadas.lat, lng: proyecto.coordenadas.lng }
    : null;

  const coordBrowser = gps?.lat && gps?.lng
    ? { lat: gps.lat, lng: gps.lng }
    : null;

  const ultimaFoto = fotos.length > 0 ? fotos[fotos.length - 1] : null;
  const coordExif = ultimaFoto?.exif?.tieneGPS && ultimaFoto.exif.latitud != null && ultimaFoto.exif.longitud != null
    ? { lat: ultimaFoto.exif.latitud, lng: ultimaFoto.exif.longitud }
    : null;

  const distanciaBrowserProyecto = coordBrowser && coordProyecto
    ? haversineDistance(coordBrowser, coordProyecto)
    : null;

  const distanciaExifProyecto = coordExif && coordProyecto
    ? haversineDistance(coordExif, coordProyecto)
    : null;

  const verificacionActual = ultimaFoto?.verificacion;
  const estadoVerificacion = verificacionActual?.estado || null;
  const radioAceptado = verificacionActual?.radioAceptadoMetros || 500;

  const t = (val) => typeof val === 'number' && !isNaN(val);
  const fmtLat = (v) => v != null ? (v >= 0 ? `S ${Math.abs(v).toFixed(6)}°` : `N ${Math.abs(v).toFixed(6)}°`) : '—';
  const fmtLng = (v) => v != null ? (v >= 0 ? `E ${Math.abs(v).toFixed(6)}°` : `O ${Math.abs(v).toFixed(6)}°`) : '—';

  const now = new Date();
  const fechaStr = now.toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
  const horaStr = now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
  const bgImage = fotos.length > 0 ? (fotos[fotos.length - 1].preview || fotos[fotos.length - 1].url) : null;
  const unidadNombre = user?.unidadesAcceso?.length
    ? `(${typeof user.unidadesAcceso[0] === 'object' ? user.unidadesAcceso[0].nombre : user.unidadesAcceso[0]})`
    : '';

  return (
    <VerificationReportLayout
      modo="registro"
      backgroundImage={bgImage}
      proyecto={proyecto}
      usuario={user}
      fecha={fechaStr}
      hora={`${horaStr} hs.`}
      unidadNombre={unidadNombre}
    >
      {gpsError && (
        <Alert severity="warning" sx={{ mb: 2, bgcolor: 'rgba(255,180,0,0.12)', color: 'rgba(255,200,0,0.9)', '& .MuiAlert-icon': { color: 'rgba(255,200,0,0.8)' } }}>
          {gpsError}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* LEFT COLUMN: Photo evidence */}
        <Grid item xs={12} md={5}>
          <Card sx={glass.card}>
            <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
              <Typography sx={{ color: 'rgba(150,220,255,0.8)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
                <CameraAlt sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                Evidencia Fotográfica
              </Typography>

              <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                <input type="file" accept="image/*" capture="environment" ref={cameraInputRef}
                  style={{ display: 'none' }} onChange={handleCapture} />
                <Button size="small" sx={{ ...glass.btnPrimary, fontSize: '0.7rem', py: 0.8 }}
                  startIcon={<PhotoCamera sx={{ fontSize: 16 }} />}
                  onClick={() => cameraInputRef.current.click()} fullWidth>
                  Tomar Foto
                </Button>

                <input type="file" accept="image/*" ref={fileInputRef}
                  style={{ display: 'none' }} onChange={handleCapture} />
                <Button size="small" sx={{ ...glass.btnOutline, fontSize: '0.7rem', py: 0.8 }}
                  startIcon={<Upload sx={{ fontSize: 16 }} />}
                  onClick={() => fileInputRef.current.click()} fullWidth>
                  Adjuntar
                </Button>
              </Stack>

              {uploading && (
                <LinearProgress sx={{ mb: 1.5, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: 'rgba(0,150,255,0.6)' } }} />
              )}
              {uploadError && (
                <Alert severity="error" sx={{ mb: 1.5, bgcolor: 'rgba(255,50,50,0.1)', color: 'rgba(255,100,100,0.9)', py: 0, '& .MuiAlert-icon': { color: 'rgba(255,100,100,0.8)' } }}>
                  {uploadError}
                </Alert>
              )}

              {fotos.length > 0 && (
                <Box sx={{ maxHeight: 360, overflow: 'auto', '&::-webkit-scrollbar': { width: 3 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 } }}>
                  <Stack spacing={1.5}>
                    {fotos.map((foto, i) => (
                      <Card key={i} sx={{ bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 1.5, overflow: 'hidden' }}>
                        <Box sx={{ position: 'relative' }}>
                          <img src={foto.preview || foto.url} alt={`Foto ${i + 1}`}
                            style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} />
                          <Box sx={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 0.5 }}>
                            <Chip label={foto.verificacion?.estado || 'PENDIENTE'} size="small"
                              sx={
                                foto.verificacion?.estado === 'VERIFICADO' ? glass.chipVerificado :
                                foto.verificacion?.estado === 'SOSPECHOSO' ? glass.chipSospechoso :
                                glass.chipRechazado
                              } />
                            <IconButton size="small" onClick={() => removeFoto(i)}
                              sx={{ bgcolor: 'rgba(0,0,0,0.4)', '&:hover': { bgcolor: 'rgba(255,0,0,0.3)' } }}>
                              <Delete sx={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }} />
                            </IconButton>
                          </Box>
                        </Box>
                        <Box sx={{ px: 1, py: 0.8 }}>
                          {foto.exif && (
                            <>
                              {foto.exif.dispositivo && (
                                <Typography variant="caption" sx={{ color: 'rgba(150,200,255,0.6)', fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                  <Smartphone sx={{ fontSize: 10 }} /> {foto.exif.dispositivo} {foto.exif.modeloCamara}
                                </Typography>
                              )}
                              {foto.exif.fechaCaptura && (
                                <Typography variant="caption" sx={{ color: 'rgba(150,200,255,0.6)', fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                  <AccessTime sx={{ fontSize: 10 }} /> {formatDate(foto.exif.fechaCaptura)}
                                </Typography>
                              )}
                              {foto.exif.tieneGPS && (
                                <Typography variant="caption" sx={{ color: 'rgba(150,200,255,0.6)', fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                  <GpsFixed sx={{ fontSize: 10 }} /> {foto.exif.latitud?.toFixed(6)}, {foto.exif.longitud?.toFixed(6)}
                                </Typography>
                              )}
                            </>
                          )}
                          {foto.verificacion?.distanciaObraMetros != null && (
                            <Box sx={{ mt: 0.3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {foto.verificacion.ubicacionValida
                                ? <CheckCircle sx={{ fontSize: 10, color: 'rgba(0,220,180,0.7)' }} />
                                : <Warning sx={{ fontSize: 10, color: 'rgba(255,200,0,0.7)' }} />}
                              <Typography variant="caption" sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.55rem' }}>
                                {foto.verificacion.distanciaObraMetros}m
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}

              {fotos.length === 0 && !uploading && (
                <Box sx={{ textAlign: 'center', py: 4, border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 2 }}>
                  <CameraAlt sx={{ fontSize: 32, color: 'rgba(255,255,255,0.15)', mb: 1 }} />
                  <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>
                    Capture o adjunte una foto
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT COLUMN: Form fields */}
        <Grid item xs={12} md={7}>
          <Card sx={glass.card}>
            <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
              <Typography sx={{ color: 'rgba(150,220,255,0.8)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
                Datos del Avance
              </Typography>

              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Avance Físico Parcial (%)" type="number" sx={glass.input}
                    value={formData.avanceFisicoParcial}
                    onChange={(e) => setFormData({ ...formData, avanceFisicoParcial: e.target.value })} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Avance Físico Acumulado (%)" type="number" sx={glass.input}
                    value={formData.avanceFisicoAcumulado}
                    onChange={(e) => setFormData({ ...formData, avanceFisicoAcumulado: e.target.value })} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Avance Financiero Parcial (%)" type="number" sx={glass.input}
                    value={formData.avanceFinancieroParcial}
                    onChange={(e) => setFormData({ ...formData, avanceFinancieroParcial: e.target.value })} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Avance Financiero Acumulado (%)" type="number" sx={glass.input}
                    value={formData.avanceFinancieroAcumulado}
                    onChange={(e) => setFormData({ ...formData, avanceFinancieroAcumulado: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Descripción del Hito" sx={glass.input}
                    value={formData.hitoDescripcion}
                    onChange={(e) => setFormData({ ...formData, hitoDescripcion: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Actividades Realizadas" multiline rows={2} sx={glass.input}
                    value={formData.actividadesRealizadas}
                    onChange={(e) => setFormData({ ...formData, actividadesRealizadas: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Problemas Identificados" multiline rows={1.5} sx={glass.input}
                    value={formData.problemasIdentificados}
                    onChange={(e) => setFormData({ ...formData, problemasIdentificados: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField select fullWidth size="small" label="Clima" value={formData.clima} sx={glass.input}
                    onChange={(e) => setFormData({ ...formData, clima: e.target.value })}>
                    {['SOLEADO', 'NUBLADO', 'LLUVIA', 'GRANIZO', 'NIEBLA'].map((c) => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              {success && (
                <Alert severity="success" sx={{ mt: 1.5, bgcolor: 'rgba(0,200,150,0.12)', color: 'rgba(0,220,180,0.9)', '& .MuiAlert-icon': { color: 'rgba(0,220,180,0.8)' } }}>
                  Avance registrado exitosamente
                </Alert>
              )}
              {submitError && (
                <Alert severity="error" sx={{ mt: 1.5, bgcolor: 'rgba(255,50,50,0.1)', color: 'rgba(255,100,100,0.9)', '& .MuiAlert-icon': { color: 'rgba(255,100,100,0.8)' } }}>
                  {submitError}
                </Alert>
              )}

              <Box sx={{ mt: 2, display: 'flex', gap: 1.5 }}>
                <Button fullWidth sx={glass.btnPrimary} onClick={handleSubmit}
                  disabled={submitting || fotos.length === 0}>
                  {submitting ? 'Enviando...' : 'Enviar Avance'}
                </Button>
                <Button fullWidth sx={glass.btnOutline} onClick={() => navigate(-1)}>
                  Cancelar
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ===== GPS INFO PANEL (después de evidencia fotográfica) ===== */}
      {(coordBrowser || coordExif) && (
        <Card sx={{ ...glass.card, mb: 2 }}>
          <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <MyLocation sx={{ fontSize: 18, color: '#5b9aff' }} />
              <Typography sx={{ color: 'rgba(150,220,255,0.85)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Geolocalización del Avance
              </Typography>
              {estadoVerificacion && (
                <Chip
                  label={estadoVerificacion}
                  size="small"
                  sx={estadoVerificacion === 'VERIFICADO' ? glass.chipVerificado : glass.chipSospechoso}
                />
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 1.5, bgcolor: 'rgba(91,154,255,0.06)', borderRadius: 2, border: '1px solid rgba(91,154,255,0.1)' }}>
                  <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <GpsFixed sx={{ fontSize: 12 }} /> GPS del Navegador
                  </Typography>
                  {coordBrowser ? (
                    <>
                      <Typography sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 600, fontSize: '0.95rem', fontFamily: 'monospace' }}>
                        {fmtLat(gps.lat)}, {fmtLng(gps.lng)}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 0.3 }}>
                        {t(gps.altitude) && (
                          <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.65rem' }}>
                            Altitud: <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{Math.round(gps.altitude)}m</strong>
                          </Typography>
                        )}
                        {t(gps.accuracy) && (
                          <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.65rem' }}>
                            ±{Math.round(gps.accuracy)}m
                          </Typography>
                        )}
                      </Box>
                    </>
                  ) : (
                    <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                      Esperando ubicación...
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 1.5, bgcolor: coordExif ? 'rgba(0,219,180,0.06)' : 'rgba(255,255,255,0.02)', borderRadius: 2, border: `1px solid ${coordExif ? 'rgba(0,219,180,0.1)' : 'rgba(255,255,255,0.05)'}` }}>
                  <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CameraAlt sx={{ fontSize: 12 }} /> GPS de la Foto (EXIF)
                  </Typography>
                  {coordExif ? (
                    <>
                      <Typography sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 600, fontSize: '0.95rem', fontFamily: 'monospace' }}>
                        {fmtLat(ultimaFoto.exif.latitud)}, {fmtLng(ultimaFoto.exif.longitud)}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 0.3 }}>
                        {t(ultimaFoto.exif.altitud) && (
                          <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.65rem' }}>
                            Altitud: <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{Math.round(ultimaFoto.exif.altitud)}m</strong>
                          </Typography>
                        )}
                        {ultimaFoto.exif.dispositivo && (
                          <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.65rem' }}>
                            {ultimaFoto.exif.dispositivo}
                          </Typography>
                        )}
                      </Box>
                    </>
                  ) : ultimaFoto ? (
                    <Box>
                      <Typography sx={{ color: 'rgba(255,200,0,0.6)', fontSize: '0.75rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Warning sx={{ fontSize: 14 }} /> Sin datos GPS en la foto
                      </Typography>
                      {coordBrowser && (
                        <Box sx={{ mt: 0.5, pt: 0.5, borderTop: '1px solid rgba(255,180,0,0.15)' }}>
                          <Typography sx={{ color: 'rgba(255,200,0,0.5)', fontSize: '0.55rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                            <GpsFixed sx={{ fontSize: 10 }} /> GPS asignado desde navegador como referencia:
                          </Typography>
                          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500, fontSize: '0.8rem', fontFamily: 'monospace' }}>
                            {fmtLat(gps.lat)}, {fmtLng(gps.lng)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                      Capture o adjunte una foto
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>

            {(distanciaBrowserProyecto != null || distanciaExifProyecto != null) && coordProyecto && (
              <Box sx={{
                mt: 1.5, p: 1.5,
                bgcolor: estadoVerificacion === 'VERIFICADO' ? 'rgba(0,219,180,0.06)' : 'rgba(255,180,0,0.06)',
                borderRadius: 2,
                border: `1px solid ${estadoVerificacion === 'VERIFICADO' ? 'rgba(0,219,180,0.12)' : 'rgba(255,180,0,0.12)'}`,
              }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.3 }}>
                      <LocationOn sx={{ fontSize: 12, mr: 0.3, verticalAlign: 'middle' }} />
                      Proyecto
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500, fontSize: '0.8rem', fontFamily: 'monospace' }}>
                      {fmtLat(coordProyecto.lat)}, {fmtLng(coordProyecto.lng)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                    <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.3 }}>
                      Distancia {coordExif ? '(EXIF → Obra)' : coordBrowser ? '(GPS Navegador → Obra)' : ''}
                    </Typography>
                    <Typography sx={{
                      fontWeight: 800,
                      fontSize: '1.3rem',
                      fontFamily: 'monospace',
                      color: estadoVerificacion === 'VERIFICADO' ? '#00dbb4' : '#ffb300',
                    }}>
                      {distanciaBrowserProyecto != null ? `${distanciaBrowserProyecto}m` : distanciaExifProyecto != null ? `${distanciaExifProyecto}m` : '—'}
                    </Typography>
                    {!coordExif && coordBrowser && (
                      <Typography sx={{ color: 'rgba(255,200,0,0.4)', fontSize: '0.55rem', fontStyle: 'italic', mt: 0.5 }}>
                        Basado en GPS del navegador — la foto no contiene metadatos GPS
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
                    <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.3 }}>
                      Radio permitido
                    </Typography>
                    <Typography sx={{ color: 'rgba(150,200,255,0.7)', fontWeight: 600, fontSize: '0.85rem' }}>
                      {radioAceptado}m
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* EXIF Raw Panel */}
      {rawExif && (
        <Card sx={{ ...glass.card, mb: 2 }}>
          <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
            <Grid container spacing={1} sx={{ mb: 1.5 }}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1 }}>
                  <Typography sx={{ color: 'rgba(150,200,255,0.4)', fontSize: '0.55rem', textTransform: 'uppercase' }}>📡 GPS en foto</Typography>
                  <Typography sx={{ color: (rawExif.GPSLatitude || rawExif.latitude) ? '#00dbb4' : '#ffb300', fontWeight: 700, fontSize: '0.75rem', mt: 0.3 }}>
                    {(rawExif.GPSLatitude || rawExif.latitude) ? 'Detectado' : 'No detectado'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1 }}>
                  <Typography sx={{ color: 'rgba(150,200,255,0.4)', fontSize: '0.55rem', textTransform: 'uppercase' }}>📱 Dispositivo</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.7rem', mt: 0.3, fontFamily: 'monospace' }}>
                    {fmtExifVal(rawExif.Make)} {fmtExifVal(rawExif.Model)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1 }}>
                  <Typography sx={{ color: 'rgba(150,200,255,0.4)', fontSize: '0.55rem', textTransform: 'uppercase' }}>📅 Fecha toma</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.65rem', mt: 0.3, fontFamily: 'monospace' }}>
                    {fmtExifVal(rawExif.DateTimeOriginal || rawExif.CreateDate || rawExif.ModifyDate || rawExif.DateTimeDigitized || rawExif.timestamp)}
                  </Typography>
                </Box>
              </Grid>
              {rawExif.ImageWidth && rawExif.ImageLength && (
                <Grid item xs={6} sm={3}>
                  <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1 }}>
                    <Typography sx={{ color: 'rgba(150,200,255,0.4)', fontSize: '0.55rem', textTransform: 'uppercase' }}>📐 Resolución</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.65rem', mt: 0.3, fontFamily: 'monospace' }}>
                      {fmtExifVal(rawExif.ImageWidth)} × {fmtExifVal(rawExif.ImageLength)}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
            {gps && !rawExif.GPSLatitude && !rawExif.latitude && (
              <Box sx={{ mb: 1, p: 1, bgcolor: 'rgba(255,180,0,0.05)', borderRadius: 1, border: '1px solid rgba(255,180,0,0.1)' }}>
                <Typography sx={{ color: 'rgba(255,200,0,0.7)', fontWeight: 600, fontSize: '0.65rem' }}>
                  🌐 GPS asignado desde navegador: {gps.lat.toFixed(6)}, {gps.lng.toFixed(6)}
                </Typography>
              </Box>
            )}
            {/* JSON toggle */}
            <Box
              onClick={() => setExifRawOpen(!exifRawOpen)}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', pt: 0.5, borderTop: '1px solid rgba(255,255,255,0.04)' }}
            >
              <Typography sx={{ color: 'rgba(150,220,255,0.5)', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                📄 Ver JSON completo EXIF
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
                {exifRawOpen ? '▲' : '▼'}
              </Typography>
            </Box>
            {exifRawOpen && (
              <Box
                component="pre"
                sx={{
                  mt: 1, p: 1.5, borderRadius: 1,
                  bgcolor: 'rgba(0,0,0,0.3)',
                  color: 'rgba(200,220,255,0.6)',
                  fontSize: '0.65rem',
                  fontFamily: 'monospace',
                  overflow: 'auto',
                  maxHeight: 300,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {JSON.stringify(rawExif, null, 2)}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* ===== GPS WARNING DIALOG ===== */}
      <Dialog open={gpsAlertOpen} onClose={handleGpsAlertContinue} maxWidth="sm" fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(10,14,39,0.96)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,180,0,0.2)',
            borderRadius: 3,
            boxShadow: '0 8px 60px rgba(0,0,0,0.7), 0 0 40px rgba(255,180,0,0.05)',
          },
        }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'rgba(255,180,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Warning sx={{ fontSize: 18, color: '#ffb300' }} />
          </Box>
          <Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: '0.95rem' }}>
              Verificación de Geolocalización
            </Typography>
            <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.65rem' }}>
              Comparando GPS del Navegador y de la Fotografía contra la ubicación del Proyecto
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pb: 1 }}>
          {/* Distancias comparativas */}
          {gpsAlertDists && (
            <Box sx={{ p: 1.5, bgcolor: 'rgba(0,100,200,0.06)', borderRadius: 2, border: '1px solid rgba(0,100,200,0.1)', mb: 2 }}>
              <Typography sx={{ color: 'rgba(150,200,255,0.8)', fontWeight: 600, fontSize: '0.75rem', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <MyLocation sx={{ fontSize: 14 }} /> Comparación de Geolocalización
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GpsFixed sx={{ fontSize: 14, color: '#5b9aff' }} />
                      <Box>
                        <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>GPS Navegador → Obra</Typography>
                        {gps && (
                          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', fontFamily: 'monospace' }}>
                            {fmtLat(gps.lat)}, {fmtLng(gps.lng)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'monospace', color: gpsAlertDists.distBrowser != null && gpsAlertDists.distBrowser > gpsAlertDists.radio ? '#ffb300' : '#00dbb4' }}>
                        {gpsAlertDists.distBrowser != null ? `${gpsAlertDists.distBrowser}m` : '—'}
                      </Typography>
                      {gpsAlertDists.distBrowser != null && (
                        <Typography sx={{ color: gpsAlertDists.distBrowser > gpsAlertDists.radio ? 'rgba(255,200,0,0.6)' : 'rgba(0,220,180,0.6)', fontSize: '0.6rem', fontWeight: 600 }}>
                          {gpsAlertDists.distBrowser > gpsAlertDists.radio ? 'FUERA DE RANGO' : 'DENTRO DEL RANGO'}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CameraAlt sx={{ fontSize: 14, color: '#00dbb4' }} />
                      <Box>
                        <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>GPS Foto (EXIF) → Obra</Typography>
                        {coordExif && (
                          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', fontFamily: 'monospace' }}>
                            {fmtLat(coordExif.lat)}, {fmtLng(coordExif.lng)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'monospace', color: gpsAlertDists.distExif != null && gpsAlertDists.distExif > gpsAlertDists.radio ? '#ffb300' : '#00dbb4' }}>
                        {gpsAlertDists.distExif != null ? `${gpsAlertDists.distExif}m` : '—'}
                      </Typography>
                      {gpsAlertDists.distExif != null && (
                        <Typography sx={{ color: gpsAlertDists.distExif > gpsAlertDists.radio ? 'rgba(255,200,0,0.6)' : 'rgba(0,220,180,0.6)', fontSize: '0.6rem', fontWeight: 600 }}>
                          {gpsAlertDists.distExif > gpsAlertDists.radio ? 'FUERA DE RANGO' : 'DENTRO DEL RANGO'}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 0.8, bgcolor: 'rgba(255,255,255,0.01)', borderRadius: 1 }}>
                    <Typography sx={{ color: 'rgba(150,200,255,0.4)', fontSize: '0.6rem' }}>
                      <LocationOn sx={{ fontSize: 11, verticalAlign: 'middle', mr: 0.3 }} />
                      Proyecto: {coordProyecto ? `${fmtLat(coordProyecto.lat)}, ${fmtLng(coordProyecto.lng)}` : '—'}
                    </Typography>
                    <Typography sx={{ color: 'rgba(150,200,255,0.4)', fontSize: '0.6rem' }}>
                      Radio permitido: <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{gpsAlertDists.radio}m</strong>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Mensajes detallados */}
          {gpsAlertMessages.length > 0 && (
            <Box sx={{ p: 1.5, bgcolor: 'rgba(255,180,0,0.06)', borderRadius: 2, border: '1px solid rgba(255,180,0,0.1)', mb: 2 }}>
              <Typography sx={{ color: 'rgba(255,200,0,0.8)', fontWeight: 600, fontSize: '0.75rem', mb: 1 }}>
                Motivos detectados:
              </Typography>
              {gpsAlertMessages.map((msg, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.8 }}>
                  <Warning sx={{ fontSize: 14, color: '#ffb300', mt: 0.2, flexShrink: 0 }} />
                  <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem', lineHeight: 1.4 }}>
                    {msg}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          <Box sx={{ p: 1.5, bgcolor: gpsAlertPending?.verificacion?.estado === 'VERIFICADO' ? 'rgba(0,219,180,0.08)' : 'rgba(255,180,0,0.08)', borderRadius: 2, border: `1px solid ${gpsAlertPending?.verificacion?.estado === 'VERIFICADO' ? 'rgba(0,219,180,0.15)' : 'rgba(255,180,0,0.15)'}`, mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ color: 'rgba(150,200,255,0.6)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Resultado de Verificación
              </Typography>
              <Chip
                size="small"
                label={gpsAlertPending?.verificacion?.estado || 'SOSPECHOSO'}
                sx={gpsAlertPending?.verificacion?.estado === 'VERIFICADO' ? glass.chipVerificado : glass.chipSospechoso}
              />
            </Box>
            {gpsAlertPending?.verificacion?.estado !== 'VERIFICADO' && (
              <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.7rem', mt: 0.8 }}>
                Puede continuar, pero el avance quedará marcado como <strong style={{ color: '#ffb300' }}>SOSPECHOSO</strong> para revisión del supervisor.
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<PhotoCamera />}
            onClick={handleGpsAlertRetry}
            sx={{
              color: 'rgba(255,255,255,0.7)',
              borderColor: 'rgba(255,255,255,0.15)',
              '&:hover': { borderColor: 'rgba(255,255,255,0.3)', bgcolor: 'rgba(255,255,255,0.05)' },
              fontSize: '0.78rem',
            }}
          >
            Reintentar
          </Button>
          <Button
            variant="contained"
            onClick={handleGpsAlertContinue}
            sx={{
              bgcolor: 'rgba(255,180,0,0.2)',
              color: 'rgba(255,200,0,0.95)',
              border: '1px solid rgba(255,180,0,0.3)',
              '&:hover': { bgcolor: 'rgba(255,180,0,0.35)' },
              fontSize: '0.78rem',
            }}
          >
            Continuar de todas formas
          </Button>
        </DialogActions>
      </Dialog>
    </VerificationReportLayout>
  );
};

export default RegistrarAvance;
