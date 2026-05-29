import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, LinearProgress,
  Divider, Dialog, DialogTitle, DialogContent, Stack,
  DialogActions, TextField, Alert,
} from '@mui/material';
import {
  ArrowBack, CheckCircle, Warning, Cancel, GpsFixed, AccessTime,
  Smartphone, CameraAlt, LocationOn,
} from '@mui/icons-material';
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
};

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

  useEffect(() => {
    fetchAvance();
  }, [id]);

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

  if (loading) return <Box sx={{ p: 3 }}><LinearProgress /></Box>;
  if (!avance) return <Box sx={{ p: 3 }}><Alert severity="error">Avance no encontrado</Alert></Box>;

  const bgImage = avance.fotos?.length > 0 ? avance.fotos[0].url : null;
  const unidadNombre = avance.proyectoId?.unidadResponsable?.nombre
    ? `(${avance.proyectoId.unidadResponsable.nombre})`
    : '';
  const fechaReporte = avance.fechaReporte ? new Date(avance.fechaReporte) : new Date();
  const fechaStr = fechaReporte.toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
  const horaStr = fechaReporte.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });

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
              <Typography sx={{ color: 'rgba(150,220,255,0.8)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
                <CameraAlt sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                Evidencia Fotográfica ({avance.fotos?.length || 0})
              </Typography>

              {!avance.fotos || avance.fotos.length === 0 ? (
                <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', textAlign: 'center', py: 4 }}>
                  Sin fotos
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 400, overflow: 'auto', '&::-webkit-scrollbar': { width: 3 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 } }}>
                  <Stack spacing={1.5}>
                    {avance.fotos.map((foto, i) => (
                      <Card key={i} sx={{ bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 1.5, overflow: 'hidden' }}>
                        <img src={foto.url} alt={`Foto ${i + 1}`}
                          style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
                        <Box sx={{ px: 1, py: 0.8 }}>
                          <Box sx={{ display: 'flex', gap: 0.5, mb: 0.8, flexWrap: 'wrap' }}>
                            <Chip label={foto.verificacion?.estado || 'PENDIENTE'} size="small"
                              sx={foto.verificacion?.estado === 'VERIFICADO' ? glass.chipVerificado : glass.chipSospechoso} />
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
