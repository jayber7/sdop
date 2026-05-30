import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, IconButton, LinearProgress,
  Divider, Dialog, DialogTitle, DialogContent, Stack,
  DialogActions, TextField, Alert,
} from '@mui/material';
import {
  ArrowBack, CheckCircle, Warning, Cancel, GpsFixed, AccessTime,
  Smartphone, CameraAlt, LocationOn, MyLocation, AddAPhoto, PhotoCamera, Upload, Delete,
} from '@mui/icons-material';
import exifr from 'exifr';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import VerificationReportLayout from '../components/VerificationReportLayout';

const ESTADO_COLORS = {
  BORRADOR: 'default',
  ENVIADO: 'info',
  APROBADO: 'success',
  OBSERVADO: 'error',
};

const CLIMA_LABELS = {
  SOLEADO: 'Soleado',
  NUBLADO: 'Nublado',
  LLUVIA: 'Lluvia',
  GRANIZO: 'Granizo',
  NIEBLA: 'Niebla',
};

const glass = {
  card: {
    bgcolor: 'rgba(10,14,39,0.6)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(100,180,255,0.12)',
    borderRadius: 2,
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
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
  btnApprove: {
    bgcolor: 'rgba(0,200,150,0.2)',
    color: 'rgba(0,220,180,0.95)',
    border: '1px solid rgba(0,220,180,0.3)',
    '&:hover': { bgcolor: 'rgba(0,200,150,0.35)' },
  },
  btnObserve: {
    bgcolor: 'rgba(255,80,80,0.2)',
    color: 'rgba(255,120,120,0.95)',
    border: '1px solid rgba(255,80,80,0.3)',
    '&:hover': { bgcolor: 'rgba(255,80,80,0.35)' },
  },
  btnEvidence: {
    bgcolor: 'rgba(0,150,255,0.15)',
    color: 'rgba(150,220,255,0.9)',
    border: '1px solid rgba(0,150,255,0.25)',
    fontSize: '0.7rem',
    '&:hover': { bgcolor: 'rgba(0,150,255,0.3)' },
  },
};

const fmtExifVal = (v) => {
  if (v == null) return '?';
  if (v instanceof Date) return v.toISOString().replace('T', ' ').split('.')[0];
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};
function fmtLat(v) {
  return v != null ? (v >= 0 ? `S ${Math.abs(v).toFixed(6)}°` : `N ${Math.abs(v).toFixed(6)}°`) : '—';
}
function fmtLng(v) {
  return v != null ? (v >= 0 ? `E ${Math.abs(v).toFixed(6)}°` : `O ${Math.abs(v).toFixed(6)}°`) : '—';
}

const AvanceDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [avance, setAvance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [accion, setAccion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Evidencia extra
  const cameraRef = useRef(null);
  const fileRef = useRef(null);
  const [gps, setGps] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [uploadingEvidencia, setUploadingEvidencia] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [deletingFoto, setDeletingFoto] = useState(null);
  const [rawExif, setRawExif] = useState(null);
  const [exifRawOpen, setExifRawOpen] = useState(false);

  useEffect(() => {
    fetchAvance();
    getCurrentLocation();
  }, [id]);

  const getCurrentLocation = () => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError('Geolocalización no soportada');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      () => setGpsError('No se pudo obtener ubicación'),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleCaptureEvidencia = async (e, isCamera) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError(null);
    setUploadSuccess(null);
    setUploadingEvidencia(true);
    try {
      let exifData = null;
      try { exifData = await exifr.parse(file, { gps: true }); } catch (e) {}
      if (!exifData?.latitude) {
        try { exifData = await exifr.gps(file); } catch (e) {}
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

      const coords = avance?.proyectoId?.coordenadas;
      if (coords) {
        fd.append('proyectoCoords', JSON.stringify(coords));
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

      await api.put(`/avances/${id}/fotos`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadSuccess('Evidencia agregada correctamente');
      fetchAvance();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Error al subir la foto');
    } finally {
      setUploadingEvidencia(false);
      e.target.value = '';
    }
  };

  const handleDeleteFoto = async (fotoId) => {
    setDeletingFoto(fotoId);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      await api.delete(`/avances/${id}/fotos/${fotoId}`);
      setUploadSuccess('Foto eliminada correctamente');
      fetchAvance();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Error al eliminar la foto');
    } finally {
      setDeletingFoto(null);
    }
  };

  const fetchAvance = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/avances/${id}`);
      setAvance(res.data.data);
    } catch (err) {
      setError('Error al cargar el avance');
    } finally {
      setLoading(false);
    }
  };

  const handleAprobarObservar = async () => {
    setSubmitting(true);
    try {
      const endpoint = accion === 'APROBAR' ? 'aprobar' : 'observar';
      await api.put(`/avances/${id}/${endpoint}`, { observaciones });
      setSuccess(`Avance ${accion.toLowerCase()} correctamente`);
      setDialogOpen(false);
      fetchAvance();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar');
    } finally {
      setSubmitting(false);
    }
  };

  const openDialog = (tipo) => {
    setAccion(tipo);
    setObservaciones('');
    setDialogOpen(true);
    setError(null);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-BO', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const canManage = user?.rol === 'ADMIN' || user?.rol === 'SUPERVISOR';
  const canAddEvidence = (user?.rol === 'ADMIN' || user?.rol === 'INSPECTOR') && avance?.estado !== 'APROBADO';

  if (loading) return <Box sx={{ p: 3 }}><LinearProgress /></Box>;
  if (!avance) return <Box sx={{ p: 3 }}><Alert severity="error">Avance no encontrado</Alert></Box>;

  const bgImage = avance.fotos?.length > 0 ? avance.fotos[0].url : null;
  const unidadNombre = avance.proyectoId?.unidadResponsable?.nombre
    ? `(${avance.proyectoId.unidadResponsable.nombre})`
    : '';
  const fechaReporte = avance.fechaReporte ? new Date(avance.fechaReporte) : new Date();
  const fechaStr = fechaReporte.toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
  const horaStr = fechaReporte.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });

  const coordProyecto = avance.proyectoId?.coordenadas?.lat && avance.proyectoId?.coordenadas?.lng
    ? { lat: avance.proyectoId.coordenadas.lat, lng: avance.proyectoId.coordenadas.lng }
    : null;

  const ultimaFoto = avance.fotos?.length > 0 ? avance.fotos[avance.fotos.length - 1] : null;
  const coordExif = ultimaFoto?.exif?.tieneGPS && ultimaFoto.exif.latitud != null && ultimaFoto.exif.longitud != null
    ? { lat: ultimaFoto.exif.latitud, lng: ultimaFoto.exif.longitud }
    : null;

  const estadoVerificacion = ultimaFoto?.verificacion?.estado || null;
  const distanciaObra = ultimaFoto?.verificacion?.distanciaObraMetros;
  const radioAceptado = ultimaFoto?.verificacion?.radioAceptadoMetros || 500;

  return (
    <VerificationReportLayout
      mode="detalle"
      backgroundImage={bgImage}
      proyecto={avance.proyectoId}
      avance={avance}
      usuario={avance.registradoPor}
      fecha={fechaStr}
      hora={`${horaStr} hs.`}
      unidadNombre={unidadNombre}
      verificationCode={avance.codigoVerificacion}
    >
      {success && <Alert severity="success" sx={{ mb: 2, bgcolor: 'rgba(0,200,150,0.12)', color: 'rgba(0,220,180,0.9)', '& .MuiAlert-icon': { color: 'rgba(0,220,180,0.8)' } }}>{success}</Alert>}
      {error && !dialogOpen && <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(255,50,50,0.1)', color: 'rgba(255,100,100,0.9)', '& .MuiAlert-icon': { color: 'rgba(255,100,100,0.8)' } }}>{error}</Alert>}

      <Grid container spacing={2}>
        {/* ===== GPS INFO PANEL (prominent) ===== */}
        {(coordProyecto || coordExif) && (
          <Grid item xs={12}>
            <Card sx={glass.card}>
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
                      sx={
                        estadoVerificacion === 'VERIFICADO' ? glass.chipVerificado :
                        estadoVerificacion === 'SOSPECHOSO' ? glass.chipSospechoso :
                        glass.chipRechazado
                      }
                    />
                  )}
                </Box>

                <Grid container spacing={2}>
                  {/* EXIF GPS */}
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
                            {ultimaFoto.exif.altitud != null && (
                              <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.65rem' }}>
                                Altitud: <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{Math.round(ultimaFoto.exif.altitud)}m</strong>
                              </Typography>
                            )}
                            {ultimaFoto.exif.dispositivo && (
                              <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.65rem' }}>
                                {ultimaFoto.exif.dispositivo} {ultimaFoto.exif.modeloCamara}
                              </Typography>
                            )}
                          </Box>
                        </>
                      ) : (
                        <Box>
                          <Typography sx={{ color: 'rgba(255,200,0,0.6)', fontSize: '0.75rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Warning sx={{ fontSize: 14 }} /> Sin datos GPS en la foto
                          </Typography>
                          {distanciaObra != null && (
                            <Typography sx={{ color: 'rgba(255,200,0,0.4)', fontSize: '0.6rem', fontStyle: 'italic', mt: 0.5 }}>
                              La foto no contenía metadatos GPS. La distancia se calculó con la ubicación del dispositivo al momento de la captura.
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  {/* Project coordinates */}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ p: 1.5, bgcolor: 'rgba(91,154,255,0.06)', borderRadius: 2, border: '1px solid rgba(91,154,255,0.1)' }}>
                      <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn sx={{ fontSize: 12 }} /> Ubicación del Proyecto
                      </Typography>
                      {coordProyecto ? (
                        <Typography sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 600, fontSize: '0.95rem', fontFamily: 'monospace' }}>
                          {fmtLat(coordProyecto.lat)}, {fmtLng(coordProyecto.lng)}
                        </Typography>
                      ) : (
                        <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                          Sin coordenadas registradas
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>

                {/* Distance bar */}
                {distanciaObra != null && coordProyecto && (
                  <Box sx={{
                    mt: 1.5, p: 1.5,
                    bgcolor: estadoVerificacion === 'VERIFICADO' ? 'rgba(0,219,180,0.06)' : 'rgba(255,180,0,0.06)',
                    borderRadius: 2,
                    border: `1px solid ${estadoVerificacion === 'VERIFICADO' ? 'rgba(0,219,180,0.12)' : 'rgba(255,180,0,0.12)'}`,
                  }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.3 }}>
                          Proyecto
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500, fontSize: '0.8rem', fontFamily: 'monospace' }}>
                          {fmtLat(coordProyecto.lat)}, {fmtLng(coordProyecto.lng)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                        <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.3 }}>
                          Distancia {ultimaFoto?.exif?.tieneGPS ? '(EXIF → Obra)' : '(GPS Navegador → Obra)'}
                        </Typography>
                        <Typography sx={{
                          fontWeight: 800,
                          fontSize: '1.3rem',
                          fontFamily: 'monospace',
                          color: estadoVerificacion === 'VERIFICADO' ? '#00dbb4' : '#ffb300',
                        }}>
                          {distanciaObra}m
                        </Typography>
                        {ultimaFoto && !ultimaFoto.exif?.tieneGPS && (
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
                    {ultimaFoto?.verificacion?.observaciones && (
                      <Typography sx={{ color: 'rgba(150,200,255,0.4)', fontSize: '0.65rem', fontStyle: 'italic', mt: 1, textAlign: 'center' }}>
                        {ultimaFoto.verificacion.observaciones}
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Info */}
        <Grid item xs={12} md={6}>
          <Card sx={glass.card}>
            <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
              <Typography sx={{ color: 'rgba(150,220,255,0.8)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
                <ArrowBack sx={{ fontSize: 14, mr: 0.5, cursor: 'pointer', verticalAlign: 'middle' }} onClick={() => navigate(-1)} />
                Información del Avance
              </Typography>

              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>N° Reporte</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: '0.85rem' }}>{avance.numeroReporte}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</Typography>
                  <Chip label={avance.estado} size="small"
                    color={ESTADO_COLORS[avance.estado] || 'default'}
                    sx={{ fontWeight: 600, fontSize: '0.65rem' }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avance Físico Parcial</Typography>
                  <Typography sx={{ color: 'rgba(100,200,255,0.9)', fontWeight: 600, fontSize: '0.85rem' }}>{avance.avanceFisicoParcial}%</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avance Físico Acumulado</Typography>
                  <Typography sx={{ color: 'rgba(100,200,255,0.9)', fontWeight: 600, fontSize: '0.85rem' }}>{avance.avanceFisicoAcumulado}%</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avance Financiero Parcial</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: '0.85rem' }}>{avance.avanceFinancieroParcial ?? '—'}{avance.avanceFinancieroParcial != null ? '%' : ''}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avance Financiero Acumulado</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: '0.85rem' }}>{avance.avanceFinancieroAcumulado ?? '—'}{avance.avanceFinancieroAcumulado != null ? '%' : ''}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clima</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: '0.85rem' }}>{CLIMA_LABELS[avance.clima] || avance.clima || '—'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registrado por</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: '0.85rem' }}>{avance.registradoPor?.nombre || '—'}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />

              {avance.hitoDescripcion && (
                <Box sx={{ mb: 1 }}>
                  <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.3 }}>Descripción del Hito</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem' }}>{avance.hitoDescripcion}</Typography>
                </Box>
              )}
              {avance.actividadesRealizadas && (
                <Box sx={{ mb: 1 }}>
                  <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.3 }}>Actividades Realizadas</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{avance.actividadesRealizadas}</Typography>
                </Box>
              )}
              {avance.problemasIdentificados && (
                <Box sx={{ mb: 1 }}>
                  <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.3 }}>Problemas Identificados</Typography>
                  <Typography sx={{ color: 'rgba(255,200,0,0.7)', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{avance.problemasIdentificados}</Typography>
                </Box>
              )}

              {avance.aprobadoPor && (
                <>
                  <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {avance.estado === 'APROBADO'
                      ? <CheckCircle sx={{ fontSize: 16, color: 'rgba(0,220,180,0.8)' }} />
                      : <Cancel sx={{ fontSize: 16, color: 'rgba(255,100,100,0.8)' }} />}
                    <Box>
                      <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>
                        {avance.estado === 'APROBADO' ? 'Aprobado' : 'Observado'} por <strong>{avance.aprobadoPor?.nombre}</strong>
                      </Typography>
                      <Typography sx={{ color: 'rgba(150,200,255,0.4)', fontSize: '0.6rem' }}>{formatDate(avance.fechaAprobacion)}</Typography>
                    </Box>
                  </Box>
                  {avance.observacionesSupervisor && (
                    <Alert severity={avance.estado === 'APROBADO' ? 'success' : 'warning'}
                      sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', py: 0.5, '& .MuiAlert-icon': { fontSize: 16 } }}>
                      {avance.observacionesSupervisor}
                    </Alert>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Photos */}
        <Grid item xs={12} md={6}>
          <Card sx={glass.card}>
            <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography sx={{ color: 'rgba(150,220,255,0.8)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CameraAlt sx={{ fontSize: 14 }} />
                  Evidencia Fotográfica ({avance.fotos?.length || 0})
                </Typography>
                {canAddEvidence && (
                  <>
                    <input type="file" accept="image/*" capture="environment" ref={cameraRef}
                      style={{ display: 'none' }} onChange={(e) => handleCaptureEvidencia(e, true)} />
                    <input type="file" accept="image/*" ref={fileRef}
                      style={{ display: 'none' }} onChange={(e) => handleCaptureEvidencia(e, false)} />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button size="small" sx={glass.btnEvidence}
                        startIcon={<PhotoCamera sx={{ fontSize: 14 }} />}
                        onClick={() => cameraRef.current.click()}>
                        Cámara
                      </Button>
                      <Button size="small" sx={glass.btnEvidence}
                        startIcon={<Upload sx={{ fontSize: 14 }} />}
                        onClick={() => fileRef.current.click()}>
                        Adjuntar
                      </Button>
                    </Box>
                  </>
                )}
              </Box>

              {uploadingEvidencia && (
                <LinearProgress sx={{ mb: 1.5, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: 'rgba(0,150,255,0.6)' } }} />
              )}
              {uploadSuccess && (
                <Alert severity="success" sx={{ mb: 1.5, bgcolor: 'rgba(0,200,150,0.12)', color: 'rgba(0,220,180,0.9)', py: 0.3, '& .MuiAlert-icon': { fontSize: 14, color: 'rgba(0,220,180,0.8)' } }}>
                  {uploadSuccess}
                </Alert>
              )}
              {uploadError && (
                <Alert severity="error" sx={{ mb: 1.5, bgcolor: 'rgba(255,50,50,0.1)', color: 'rgba(255,100,100,0.9)', py: 0.3, '& .MuiAlert-icon': { fontSize: 14, color: 'rgba(255,100,100,0.8)' } }}>
                  {uploadError}
                </Alert>
              )}

              {/* EXIF Raw Panel */}
              {rawExif && (
                <Box sx={{ mb: 1.5 }}>
                  {/* Summary */}
                  <Grid container spacing={0.5} sx={{ mb: 1 }}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 0.8, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 0.5 }}>
                        <Typography sx={{ color: 'rgba(150,200,255,0.4)', fontSize: '0.5rem', textTransform: 'uppercase' }}>📡 GPS en foto</Typography>
                        <Typography sx={{ color: (rawExif.GPSLatitude || rawExif.latitude) ? '#00dbb4' : '#ffb300', fontWeight: 700, fontSize: '0.65rem', mt: 0.2 }}>
                          {(rawExif.GPSLatitude || rawExif.latitude) ? 'Detectado' : 'No detectado'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 0.8, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 0.5 }}>
                        <Typography sx={{ color: 'rgba(150,200,255,0.4)', fontSize: '0.5rem', textTransform: 'uppercase' }}>📱 Dispositivo</Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.6rem', mt: 0.2, fontFamily: 'monospace' }}>
                          {fmtExifVal(rawExif.Make)} {fmtExifVal(rawExif.Model)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ p: 0.8, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 0.5 }}>
                        <Typography sx={{ color: 'rgba(150,200,255,0.4)', fontSize: '0.5rem', textTransform: 'uppercase' }}>📅 Fecha toma</Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.55rem', mt: 0.2, fontFamily: 'monospace' }}>
                          {fmtExifVal(rawExif.DateTimeOriginal || rawExif.DateTimeDigitized)}
                        </Typography>
                      </Box>
                    </Grid>
                    {rawExif.ImageWidth && rawExif.ImageLength && (
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ p: 0.8, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 0.5 }}>
                          <Typography sx={{ color: 'rgba(150,200,255,0.4)', fontSize: '0.5rem', textTransform: 'uppercase' }}>📐 Resolución</Typography>
                          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.55rem', mt: 0.2, fontFamily: 'monospace' }}>
                            {fmtExifVal(rawExif.ImageWidth)}×{fmtExifVal(rawExif.ImageLength)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                  {(rawExif.GPSLatitude || rawExif.latitude) && (
                    <Box sx={{ mb: 1, p: 0.8, bgcolor: 'rgba(0,219,180,0.05)', borderRadius: 0.5, border: '1px solid rgba(0,219,180,0.1)' }}>
                      <Typography sx={{ color: 'rgba(0,219,180,0.8)', fontWeight: 600, fontSize: '0.6rem', fontFamily: 'monospace' }}>
                        📍 {Number(rawExif.GPSLatitude || rawExif.latitude).toFixed(6)}, {Number(rawExif.GPSLongitude || rawExif.longitude).toFixed(6)}
                      </Typography>
                    </Box>
                  )}
                  {gps && !rawExif.GPSLatitude && !rawExif.latitude && (
                    <Box sx={{ mb: 1, p: 0.8, bgcolor: 'rgba(255,180,0,0.05)', borderRadius: 0.5, border: '1px solid rgba(255,180,0,0.1)' }}>
                      <Typography sx={{ color: 'rgba(255,200,0,0.7)', fontWeight: 600, fontSize: '0.6rem' }}>
                        🌐 GPS asignado desde navegador: {gps.lat.toFixed(6)}, {gps.lng.toFixed(6)}
                      </Typography>
                    </Box>
                  )}
                  {/* JSON toggle */}
                  <Box onClick={() => setExifRawOpen(!exifRawOpen)}
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', py: 0.5, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <Typography sx={{ color: 'rgba(150,220,255,0.4)', fontWeight: 600, fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      📄 Ver JSON completo EXIF
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>{exifRawOpen ? '▲' : '▼'}</Typography>
                  </Box>
                  {exifRawOpen && (
                    <Box component="pre" sx={{
                      mt: 0.5, p: 1.5, borderRadius: 1, bgcolor: 'rgba(0,0,0,0.3)',
                      color: 'rgba(200,220,255,0.5)', fontSize: '0.6rem', fontFamily: 'monospace',
                      overflow: 'auto', maxHeight: 250, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                    }}>
                      {JSON.stringify(rawExif, null, 2)}
                    </Box>
                  )}
                </Box>
              )}

              {!avance.fotos || avance.fotos.length === 0 ? (
                <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', textAlign: 'center', py: 4 }}>
                  Sin fotos
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 400, overflow: 'auto', '&::-webkit-scrollbar': { width: 3 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 } }}>
                  <Stack spacing={1.5}>
                    {avance.fotos.map((foto, i) => (
                      <Card key={foto._id || i} sx={{ bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 1.5, overflow: 'hidden' }}>
                        <Box sx={{ position: 'relative' }}>
                          <img src={foto.url} alt={`Foto ${i + 1}`}
                            style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
                          {canAddEvidence && (
                            <IconButton size="small" onClick={() => handleDeleteFoto(foto._id)}
                              disabled={deletingFoto === foto._id}
                              sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(255,0,0,0.4)' } }}>
                              {deletingFoto === foto._id
                                ? <LinearProgress sx={{ width: 14, height: 14, bgcolor: 'transparent', '& .MuiLinearProgress-bar': { bgcolor: 'rgba(255,255,255,0.5)' } }} />
                                : <Delete sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} />}
                            </IconButton>
                          )}
                        </Box>
                        <Box sx={{ px: 1, py: 0.8 }}>
                          <Box sx={{ display: 'flex', gap: 0.5, mb: 0.8, flexWrap: 'wrap' }}>
                            <Chip label={foto.verificacion?.estado || 'PENDIENTE'} size="small"
                              sx={
                                foto.verificacion?.estado === 'VERIFICADO' ? glass.chipVerificado :
                                foto.verificacion?.estado === 'SOSPECHOSO' ? glass.chipSospechoso :
                                glass.chipRechazado
                              } />
                            <Chip label={foto.categoria || 'VISTA_GENERAL'} size="small"
                              sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: 'rgba(150,200,255,0.6)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.6rem' }} />
                          </Box>
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
                          {foto.verificacion && foto.verificacion.distanciaObraMetros != null && (
                            <Box sx={{ mt: 0.3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOn sx={{ fontSize: 10, color: 'rgba(150,200,255,0.5)' }} />
                              <Typography variant="caption" sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.55rem' }}>
                                Distancia: {foto.verificacion.distanciaObraMetros}m
                              </Typography>
                              {foto.verificacion.ubicacionValida
                                ? <CheckCircle sx={{ fontSize: 10, color: 'rgba(0,220,180,0.7)' }} />
                                : <Warning sx={{ fontSize: 10, color: 'rgba(255,200,0,0.7)' }} />}
                            </Box>
                          )}
                          {foto.verificacion?.observaciones && (
                            <Typography variant="caption" sx={{ color: 'rgba(150,200,255,0.4)', fontSize: '0.55rem', fontStyle: 'italic', display: 'block', mt: 0.3 }}>
                              {foto.verificacion.observaciones}
                            </Typography>
                          )}
                          {foto.descripcion && (
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.6rem', display: 'block', mt: 0.3 }}>
                              {foto.descripcion}
                            </Typography>
                          )}
                        </Box>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Actions */}
        {canManage && avance.estado === 'ENVIADO' && (
          <Grid item xs={12}>
            <Card sx={glass.card}>
              <CardContent sx={{ p: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.5, md: 2 } } }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button fullWidth sx={glass.btnApprove} startIcon={<CheckCircle />}
                    onClick={() => openDialog('APROBAR')}>
                    Aprobar Avance
                  </Button>
                  <Button fullWidth sx={glass.btnObserve} startIcon={<Cancel />}
                    onClick={() => openDialog('OBSERVAR')}>
                    Observar Avance
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(10,14,39,0.95)', backdropFilter: 'blur(24px)',
            border: '1px solid rgba(100,180,255,0.12)', borderRadius: 3,
            boxShadow: '0 8px 60px rgba(0,0,0,0.7)',
          },
        }}>
        <DialogTitle sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: '1rem' }}>
          {accion === 'APROBAR' ? 'Aprobar Avance' : 'Observar Avance'}
        </DialogTitle>
        <DialogContent>
          <TextField fullWidth multiline rows={3} label="Observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder={accion === 'APROBAR' ? 'Comentario opcional...' : 'Describe las observaciones...'}
            sx={{
              mt: 1,
              '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.85)', borderRadius: 1.5, '& fieldset': { border: '1px solid rgba(255,255,255,0.1)' } },
              '& .MuiInputLabel-root': { color: 'rgba(150,200,255,0.5)', fontSize: '0.8rem' },
            }} />
          {error && <Alert severity="error" sx={{ mt: 2, bgcolor: 'rgba(255,50,50,0.1)', color: 'rgba(255,100,100,0.9)' }}>{error}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}
            sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'rgba(255,255,255,0.8)' } }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleAprobarObservar} disabled={submitting}
            sx={{
              bgcolor: accion === 'APROBAR' ? 'rgba(0,200,150,0.3)' : 'rgba(255,80,80,0.3)',
              color: accion === 'APROBAR' ? 'rgba(0,220,180,0.95)' : 'rgba(255,120,120,0.95)',
              border: `1px solid ${accion === 'APROBAR' ? 'rgba(0,220,180,0.3)' : 'rgba(255,80,80,0.3)'}`,
              '&:hover': { bgcolor: accion === 'APROBAR' ? 'rgba(0,200,150,0.5)' : 'rgba(255,80,80,0.5)' },
            }}>
            {submitting ? 'Procesando...' : accion === 'APROBAR' ? 'Aprobar' : 'Observar'}
          </Button>
        </DialogActions>
      </Dialog>
    </VerificationReportLayout>
  );
};

export default AvanceDetalle;
