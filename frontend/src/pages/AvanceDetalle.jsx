import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, LinearProgress,
  Divider, IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert,
} from '@mui/material';
import {
  ArrowBack, CheckCircle, Warning, Cancel, GpsFixed, AccessTime,
  Smartphone, CameraAlt, LocationOn,
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ESTADO_COLORS = {
  BORRADOR: 'default',
  ENVIADO: 'info',
  APROBADO: 'success',
  OBSERVADO: 'error',
};

const CLIMA_LABELS = {
  SOLEADO: '☀️ Soleado',
  NUBLADO: '☁️ Nublado',
  LLUVIA: '🌧️ Lluvia',
  GRANIZO: '🌨️ Granizo',
  NIEBLA: '🌫️ Niebla',
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

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}><ArrowBack /></IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{avance.numeroReporte}</Typography>
          <Typography variant="body2" color="text.secondary">
            {avance.proyectoId?.nombre || 'Proyecto'}
          </Typography>
        </Box>
        <Chip label={avance.estado} color={ESTADO_COLORS[avance.estado] || 'default'} sx={{ fontWeight: 600 }} />
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* Info principal */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Información del Avance</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Fecha de Reporte</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(avance.fechaReporte)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Clima</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{CLIMA_LABELS[avance.clima] || avance.clima || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Avance Físico Parcial</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>{avance.avanceFisicoParcial}%</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Avance Físico Acumulado</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>{avance.avanceFisicoAcumulado}%</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Avance Financiero Parcial</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{avance.avanceFinancieroParcial ?? 'N/A'}{avance.avanceFinancieroParcial != null ? '%' : ''}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Avance Financiero Acumulado</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{avance.avanceFinancieroAcumulado ?? 'N/A'}{avance.avanceFinancieroAcumulado != null ? '%' : ''}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" color="text.secondary">Descripción del Hito</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>{avance.hitoDescripcion || 'N/A'}</Typography>

              <Typography variant="caption" color="text.secondary">Actividades Realizadas</Typography>
              <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>{avance.actividadesRealizadas || 'N/A'}</Typography>

              <Typography variant="caption" color="text.secondary">Problemas Identificados</Typography>
              <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>{avance.problemasIdentificados || 'Ninguno'}</Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" color="text.secondary">Registrado por</Typography>
              <Typography variant="body2">{avance.registradoPor?.nombre || 'N/A'}</Typography>

              {avance.aprobadoPor && (
                <>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {avance.estado === 'APROBADO' ? 'Aprobado' : 'Observado'} por
                  </Typography>
                  <Typography variant="body2">{avance.aprobadoPor.nombre}</Typography>
                  <Typography variant="caption" color="text.secondary">{formatDate(avance.fechaAprobacion)}</Typography>
                </>
              )}

              {avance.observacionesSupervisor && (
                <>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Observaciones</Typography>
                  <Alert severity={avance.estado === 'APROBADO' ? 'success' : 'warning'} sx={{ mt: 1 }}>
                    {avance.observacionesSupervisor}
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Fotos */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                <CameraAlt sx={{ mr: 1, verticalAlign: 'middle' }} />
                Evidencia Fotográfica ({avance.fotos?.length || 0})
              </Typography>

              {!avance.fotos || avance.fotos.length === 0 ? (
                <Typography color="text.secondary">Sin fotos</Typography>
              ) : (
                <Grid container spacing={2}>
                  {avance.fotos.map((foto, i) => (
                    <Grid item xs={12} key={i}>
                      <Card variant="outlined">
                        <img src={foto.url} alt={`Foto ${i + 1}`}
                          style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: '4px 4px 0 0' }} />
                        <Box sx={{ p: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Chip
                              label={foto.verificacion?.estado || 'PENDIENTE'}
                              size="small"
                              color={foto.verificacion?.estado === 'VERIFICADO' ? 'success' : foto.verificacion?.estado === 'SOSPECHOSO' ? 'warning' : 'default'}
                            />
                            <Chip label={foto.categoria || 'VISTA_GENERAL'} size="small" variant="outlined" />
                          </Box>

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
                                <Typography variant="caption" display="block" color="warning.main">
                                  Sin GPS en EXIF
                                </Typography>
                              )}
                            </Box>
                          )}

                          {foto.verificacion && (
                            <Box sx={{ mt: 0.5 }}>
                              <Divider sx={{ my: 0.5 }} />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>Verificación:</Typography>
                              {foto.verificacion.distanciaObraMetros != null && (
                                <Typography variant="caption" display="block" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <LocationOn fontSize="inherit" sx={{ fontSize: 14 }} />
                                  Distancia: {foto.verificacion.distanciaObraMetros}m
                                  {foto.verificacion.ubicacionValida
                                    ? <CheckCircle fontSize="inherit" color="success" />
                                    : <Warning fontSize="inherit" color="warning" />}
                                </Typography>
                              )}
                              {foto.verificacion.observaciones && (
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                  {foto.verificacion.observaciones}
                                </Typography>
                              )}
                            </Box>
                          )}

                          {foto.descripcion && (
                            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                              {foto.descripcion}
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

        {/* Acciones */}
        {canManage && avance.estado === 'ENVIADO' && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Acciones</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => openDialog('APROBAR')}
                    fullWidth
                  >
                    Aprobar Avance
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => openDialog('OBSERVAR')}
                    fullWidth
                  >
                    Observar Avance
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {accion === 'APROBAR' ? 'Aprobar Avance' : 'Observar Avance'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder={accion === 'APROBAR' ? 'Comentario opcional...' : 'Describe las observaciones...'}
            sx={{ mt: 1 }}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color={accion === 'APROBAR' ? 'success' : 'error'}
            onClick={handleAprobarObservar}
            disabled={submitting}
          >
            {submitting ? 'Procesando...' : accion === 'APROBAR' ? 'Aprobar' : 'Observar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AvanceDetalle;
