import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, TextField, Grid, Chip, Alert, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Stack, IconButton,
} from '@mui/material';
import { PhotoCamera, Upload, Delete, MyLocation, CheckCircle, Warning, Cancel } from '@mui/icons-material';
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
  const [formData, setFormData] = useState({
    avanceFisicoParcial: '', avanceFisicoAcumulado: '', avanceFinancieroParcial: '',
    avanceFinancieroAcumulado: '', hitoDescripcion: '', actividadesRealizadas: '',
    problemasIdentificados: '', clima: 'SOLEADO',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
    processFile(file);
  };

  const processFile = async (file) => {
    setUploading(true);
    try {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      let exifData = null;
      try { exifData = await exifr.parse(file); } catch (e) { /* no EXIF */ }

      const formData = new FormData();
      formData.append('foto', file);
      formData.append('categoria', 'VISTA_GENERAL');

      if (gps) {
        formData.append('browserGpsLat', gps.lat);
        formData.append('browserGpsLng', gps.lng);
      }
      if (proyecto?.coordenadas) {
        formData.append('proyectoCoords', JSON.stringify(proyecto.coordenadas));
      }

      const res = await api.post('/avances/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const fotoData = res.data.data;

      setFotos((prev) => [...prev, { ...fotoData, file, preview: url }]);
    } catch (error) {
      console.error('Error uploading:', error);
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
    } finally {
      setSubmitting(false);
    }
  };

  const getDistanciaObra = (foto) => {
    if (!foto.verificacion || !proyecto?.coordenadas) return null;
    return foto.verificacion.distanciaObraMetros;
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

              {fotos.length > 0 && (
                <Grid container spacing={2}>
                  {fotos.map((foto, i) => (
                    <Grid item xs={6} key={i}>
                      <Card variant="outlined">
                        <img src={foto.preview || foto.url} alt={`Foto ${i + 1}`}
                          style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                        <Box sx={{ p: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip label={foto.verificacion?.estado || 'PENDIENTE'} size="small"
                              color={foto.verificacion?.estado === 'VERIFICADO' ? 'success' : 'warning'} />
                            <IconButton size="small" onClick={() => removeFoto(i)}><Delete fontSize="small" /></IconButton>
                          </Box>
                          {foto.exif?.tieneGPS && (
                            <Typography variant="caption" display="block">EXIF GPS: {foto.exif.latitud?.toFixed(4)}, {foto.exif.longitud?.toFixed(4)}</Typography>
                          )}
                          {foto.verificacion?.distanciaObraMetros !== null && (
                            <Typography variant="caption" display="block">
                              Distancia: {foto.verificacion.distanciaObraMetros}m
                              {foto.verificacion.ubicacionValida ? <CheckCircle fontSize="inherit" color="success" /> : <Warning fontSize="inherit" color="warning" />}
                            </Typography>
                          )}
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
                  {['SOLEADO', 'NUBLADO', 'LLUVIA', 'GRANIZO', 'NIEBLA'].map((c) => <option key={c} value={c}>{c}</option>)}
                </TextField></Grid>
              </Grid>

              {success && <Alert severity="success" sx={{ mt: 2 }}>Avance registrado exitosamente</Alert>}

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
