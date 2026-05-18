import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, TextField, Grid, Chip, Alert, LinearProgress,
  Stack, IconButton, MenuItem, Divider, Tooltip,
} from '@mui/material';
import {
  PhotoCamera, Upload, Delete, MyLocation, CheckCircle, Warning, Cancel,
  CameraAlt, GpsFixed, AccessTime, Smartphone,
} from '@mui/icons-material';
import exifr from 'exifr';
import api from '../services/api';

const RegistrarAvance = () => {
  const { proyectoId } = useParams();
  const navigate = useNavigate();
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
    if (proyectoId) {
      api.get(`/gestion/proyectos/${proyectoId}`).then((res) => setProyecto(res.data.data));
    }
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
      (err) => setGpsError('Se requiere acceso a ubicación para registrar avances'),
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

      // Extraer EXIF en el frontend ANTES de subir
      let exifData = null;
      try {
        exifData = await exifr.parse(file);
      } catch (e) {
        // No hay EXIF, no es error
      }

      const formData = new FormData();
      formData.append('foto', file);
      formData.append('categoria', 'VISTA_GENERAL');

      // GPS del navegador
      if (gps) {
        formData.append('browserGpsLat', gps.lat);
        formData.append('browserGpsLng', gps.lng);
      }

      // Coordenadas del proyecto
      if (proyecto?.coordenadas) {
        formData.append('proyectoCoords', JSON.stringify(proyecto.coordenadas));
      }

      // ENVIAR EXIF extraído en el frontend como campos adicionales
      if (exifData) {
        if (exifData.latitude) formData.append('exifLat', exifData.latitude.toString());
        if (exifData.longitude) formData.append('exifLng', exifData.longitude.toString());
        if (exifData.altitude) formData.append('exifAlt', exifData.altitude.toString());
        if (exifData.DateTimeOriginal) formData.append('exifDate', exifData.DateTimeOriginal.toISOString());
        if (exifData.Make) formData.append('exifMake', exifData.Make);
        if (exifData.Model) formData.append('exifModel', exifData.Model);
      }

      const res = await api.post('/avances/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const fotoData = res.data.data;

      // Si el backend no pudo extraer EXIF (Cloudinary lo eliminó), usar el del frontend
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
      console.error('Error uploading:', error);
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
      console.error('Error:', error);
      setSubmitError(error.response?.data?.message || 'Error al registrar el avance');
    } finally {
      setSubmitting(false);
    }
  };

  const getDistanciaObra = (foto) => {
    if (!foto.verificacion || !proyecto?.coordenadas) return null;
    return foto.verificacion.distanciaObraMetros;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-BO') + ' ' + d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Registrar Avance {proyecto && `- ${proyecto.nombre}`}
      </Typography>

      {gpsError && <Alert severity="warning" sx={{ mb: 2 }}>{gpsError}</Alert>}
      {gps && (
        <Card sx={{ mb: 3, bgcolor: 'success.lighter' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MyLocation color="success" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Ubicación verificada</Typography>
            </Box>
            <Typography variant="caption">{gps.lat.toFixed(6)}, {gps.lng.toFixed(6)} (precisión: {Math.round(gps.accuracy)}m)</Typography>
            {proyecto?.coordenadas && gps && (
              <Typography variant="caption" display="block">
                Distancia a obra: {Math.round(
                  6371e3 * 2 * Math.asin(Math.sqrt(
                    Math.sin(((gps.lat - proyecto.coordenadas.lat) * Math.PI / 180) / 2) ** 2 +
                    Math.cos(gps.lat * Math.PI / 180) * Math.cos(proyecto.coordenadas.lat * Math.PI / 180) *
                    Math.sin(((gps.lng - proyecto.coordenadas.lng) * Math.PI / 180) / 2) ** 2
                  ))
                )}m
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Evidencia Fotográfica</Typography>

              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <input type="file" accept="image/*" capture="environment" ref={cameraInputRef}
                  style={{ display: 'none' }} onChange={handleCapture} />
                <Button variant="outlined" startIcon={<PhotoCamera />} onClick={() => cameraInputRef.current.click()}
                  fullWidth>Tomar Foto</Button>

                <input type="file" accept="image/*" ref={fileInputRef}
                  style={{ display: 'none' }} onChange={handleCapture} />
                <Button variant="outlined" startIcon={<Upload />} onClick={() => fileInputRef.current.click()}
                  fullWidth>Adjuntar</Button>
              </Stack>

              {uploading && <LinearProgress sx={{ mb: 2 }} />}
              {uploadError && <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>}

              {fotos.length > 0 && (
                <Grid container spacing={2}>
                  {fotos.map((foto, i) => (
                    <Grid item xs={12} key={i}>
                      <Card variant="outlined">
                        <img src={foto.preview || foto.url} alt={`Foto ${i + 1}`}
                          style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                        <Box sx={{ p: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Chip label={foto.verificacion?.estado || 'PENDIENTE'} size="small"
                              color={foto.verificacion?.estado === 'VERIFICADO' ? 'success' : 'warning'} />
                            <IconButton size="small" onClick={() => removeFoto(i)}><Delete fontSize="small" /></IconButton>
                          </Box>

                          {/* Metadatos EXIF del frontend */}
                          {foto.exif && (
                            <Box sx={{ mb: 1 }}>
                              {foto.exif.dispositivo && (
                                <Typography variant="caption" display="block" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Smartphone fontSize="inherit" sx={{ fontSize: 14 }} />
                                  {foto.exif.dispositivo} {foto.exif.modeloCamara}
                                </Typography>
                              )}
                              {foto.exif.fechaCaptura && (
                                <Typography variant="caption" display="block" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <AccessTime fontSize="inherit" sx={{ fontSize: 14 }} />
                                  {formatDate(foto.exif.fechaCaptura)}
                                </Typography>
                              )}
                              {foto.exif.tieneGPS && (
                                <Typography variant="caption" display="block" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <GpsFixed fontSize="inherit" sx={{ fontSize: 14 }} />
                                  EXIF: {foto.exif.latitud?.toFixed(6)}, {foto.exif.longitud?.toFixed(6)}
                                </Typography>
                              )}
                              {!foto.exif.tieneGPS && foto.exif.dispositivo && (
                                <Typography variant="caption" display="block" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Warning fontSize="inherit" sx={{ fontSize: 14 }} />
                                  Sin GPS en EXIF
                                </Typography>
                              )}
                            </Box>
                          )}

                          {/* Verificación geográfica */}
                          <Divider sx={{ my: 0.5 }} />
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="caption" display="block" sx={{ fontWeight: 600 }}>
                              Verificación:
                            </Typography>
                            {foto.verificacion?.distanciaObraMetros !== null && (
                              <Typography variant="caption" display="block" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {foto.verificacion.ubicacionValida
                                  ? <CheckCircle fontSize="inherit" color="success" />
                                  : <Warning fontSize="inherit" color="warning" />}
                                Distancia: {foto.verificacion.distanciaObraMetros}m
                              </Typography>
                            )}
                            {foto.verificacion?.observaciones && (
                              <Typography variant="caption" display="block" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                {foto.verificacion.observaciones}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Datos del Avance</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}><TextField fullWidth size="small" label="Avance Físico Parcial (%)" type="number"
                  value={formData.avanceFisicoParcial} onChange={(e) => setFormData({ ...formData, avanceFisicoParcial: e.target.value })} /></Grid>
                <Grid item xs={6}><TextField fullWidth size="small" label="Avance Físico Acumulado (%)" type="number"
                  value={formData.avanceFisicoAcumulado} onChange={(e) => setFormData({ ...formData, avanceFisicoAcumulado: e.target.value })} /></Grid>
                <Grid item xs={6}><TextField fullWidth size="small" label="Avance Financiero Parcial (%)" type="number"
                  value={formData.avanceFinancieroParcial} onChange={(e) => setFormData({ ...formData, avanceFinancieroParcial: e.target.value })} /></Grid>
                <Grid item xs={6}><TextField fullWidth size="small" label="Avance Financiero Acumulado (%)" type="number"
                  value={formData.avanceFinancieroAcumulado} onChange={(e) => setFormData({ ...formData, avanceFinancieroAcumulado: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField fullWidth size="small" label="Descripción del Hito"
                  value={formData.hitoDescripcion} onChange={(e) => setFormData({ ...formData, hitoDescripcion: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField fullWidth size="small" label="Actividades Realizadas" multiline rows={3}
                  value={formData.actividadesRealizadas} onChange={(e) => setFormData({ ...formData, actividadesRealizadas: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField fullWidth size="small" label="Problemas Identificados" multiline rows={2}
                  value={formData.problemasIdentificados} onChange={(e) => setFormData({ ...formData, problemasIdentificados: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField select fullWidth size="small" label="Clima" value={formData.clima}
                  onChange={(e) => setFormData({ ...formData, clima: e.target.value })}>
                  {['SOLEADO', 'NUBLADO', 'LLUVIA', 'GRANIZO', 'NIEBLA'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField></Grid>
              </Grid>

              {success && <Alert severity="success" sx={{ mt: 2 }}>Avance registrado exitosamente</Alert>}
              {submitError && <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>}

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button variant="contained" fullWidth onClick={handleSubmit} disabled={submitting || fotos.length === 0}>
                  {submitting ? 'Enviando...' : 'Enviar Avance'}
                </Button>
                <Button variant="outlined" fullWidth onClick={() => navigate(-1)}>Cancelar</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RegistrarAvance;
