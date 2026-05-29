import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, TextField, Grid, Chip, Alert, LinearProgress,
  Stack, IconButton, MenuItem, Divider,
} from '@mui/material';
import {
  PhotoCamera, Upload, Delete, CheckCircle, Warning, Cancel,
  CameraAlt, GpsFixed, AccessTime, Smartphone, MyLocation,
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
    avanceFisicoParcial: '', avanceFisicoAcumulado: '', avanceFinancieroParcial: '',
    avanceFinancieroAcumulado: '', hitoDescripcion: '', actividadesRealizadas: '',
    problemasIdentificados: '', clima: 'SOLEADO',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

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

  const processFile = async (file) => {
    setUploading(true);
    setUploadError(null);
    try {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      let exifData = null;
      try {
        exifData = await exifr.parse(file);
      } catch (e) {}

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

      if (exifData) {
        if (exifData.latitude) fd.append('exifLat', exifData.latitude.toString());
        if (exifData.longitude) fd.append('exifLng', exifData.longitude.toString());
        if (exifData.altitude) fd.append('exifAlt', exifData.altitude.toString());
        if (exifData.DateTimeOriginal) fd.append('exifDate', exifData.DateTimeOriginal.toISOString());
        if (exifData.Make) fd.append('exifMake', exifData.Make);
        if (exifData.Model) fd.append('exifModel', exifData.Model);
      }

      const res = await api.post('/avances/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const fotoData = res.data.data;

      if (!fotoData.exif?.tieneGPS && exifData) {
        fotoData.exif = {
          latitud: exifData.latitude || null,
          longitud: exifData.longitude || null,
          altitud: exifData.altitude || null,
          fechaCaptura: exifData.DateTimeOriginal || null,
          dispositivo: exifData.Make || null,
          modeloCamara: exifData.Model || null,
          tieneGPS: !!(exifData.latitude && exifData.longitude),
        };
      }

      setFotos((prev) => [...prev, { ...fotoData, file, preview: url }]);
    } catch (error) {
      setUploadError(error.response?.data?.message || 'Error al subir la foto');
    } finally {
      setUploading(false);
      setPreviewUrl(null);
    }
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

  const now = new Date();
  const fechaStr = now.toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
  const horaStr = now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
  const bgImage = fotos.length > 0 ? (fotos[fotos.length - 1].preview || fotos[fotos.length - 1].url) : null;
  const unidadNombre = user?.unidadesAcceso?.length
    ? `(${typeof user.unidadesAcceso[0] === 'object' ? user.unidadesAcceso[0].nombre : user.unidadesAcceso[0]})`
    : '';

  return (
    <VerificationReportLayout
      mode="registro"
      backgroundImage={bgImage}
      proyecto={proyecto}
      usuario={user}
      fecha={fechaStr}
      hora={`${horaStr} hs.`}
      unidadNombre={unidadNombre}
    >
      {/* GPS alert */}
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
                              sx={foto.verificacion?.estado === 'VERIFICADO' ? glass.chipVerificado : glass.chipSospechoso} />
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
    </VerificationReportLayout>
  );
};

export default RegistrarAvance;
