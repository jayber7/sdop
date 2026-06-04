import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Dialog, IconButton, LinearProgress, Alert, Card, TextField, Grid, Chip, MenuItem, Button,
} from '@mui/material';
import { Close, Save, Smartphone, AccessTime, GpsFixed, LocationOn, CheckCircle, Warning, CameraAlt } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { can } from '../utils/permissions';

export default function AvanceEditModal({ avanceId, onClose, onSaved }) {
  const [avance, setAvance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    avanceFisicoParcial: '', avanceFisicoAcumulado: '',
    avanceFinancieroParcial: '', avanceFinancieroAcumulado: '',
    hitoDescripcion: '', actividadesRealizadas: '',
    problemasIdentificados: '', clima: 'SOLEADO', estado: '',
  });

  useEffect(() => {
    if (!avanceId) return;
    setLoading(true);
    api.get(`/avances/${avanceId}`)
      .then((res) => {
        const a = res.data.data;
        setAvance(a);
        setFormData({
          avanceFisicoParcial: String(a.avanceFisicoParcial ?? ''),
          avanceFisicoAcumulado: String(a.avanceFisicoAcumulado ?? ''),
          avanceFinancieroParcial: String(a.avanceFinancieroParcial ?? ''),
          avanceFinancieroAcumulado: String(a.avanceFinancieroAcumulado ?? ''),
          hitoDescripcion: a.hitoDescripcion || '',
          actividadesRealizadas: a.actividadesRealizadas || '',
          problemasIdentificados: a.problemasIdentificados || '',
          clima: a.clima || 'SOLEADO',
          estado: a.estado || '',
        });
      })
      .catch((err) => setError(err.response?.data?.message || 'Error al cargar'))
      .finally(() => setLoading(false));
  }, [avanceId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        ...formData,
        avanceFisicoParcial: parseFloat(formData.avanceFisicoParcial),
        avanceFisicoAcumulado: parseFloat(formData.avanceFisicoAcumulado),
        avanceFinancieroParcial: parseFloat(formData.avanceFinancieroParcial),
        avanceFinancieroAcumulado: parseFloat(formData.avanceFinancieroAcumulado),
      };
      await api.put(`/avances/${avanceId}`, payload);
      onSaved?.();
      onClose();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const field = (label, value, key, opts = {}) => (
    <TextField fullWidth size="small" label={label} value={value}
      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
      sx={{
        '& .MuiOutlinedInput-root': {
          bgcolor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.85)',
          '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
          '&:hover fieldset': { borderColor: 'rgba(100,180,255,0.3)' },
          '&.Mui-focused fieldset': { borderColor: 'rgba(100,180,255,0.5)' },
        },
        '& .MuiInputLabel-root': { color: 'rgba(150,200,255,0.5)', fontSize: '0.75rem' },
        '& .MuiInputLabel-root.Mui-focused': { color: 'rgba(100,180,255,0.7)' },
      }}
      {...opts} />
  );

  return (
    <Dialog open={!!avanceId} onClose={onClose} fullScreen
      PaperProps={{
        sx: { bgcolor: '#0a0e27', backgroundImage: 'radial-gradient(ellipse at 20% 20%, rgba(0,100,200,0.08) 0%, transparent 60%)', color: 'rgba(255,255,255,0.9)' },
      }}>
      <Box sx={{ position: 'relative', height: '100%', overflow: 'auto' }}>
        <Box sx={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5, bgcolor: 'rgba(10,14,39,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>Editar Avance</Typography>
            <Typography variant="caption" color="text.secondary">{avance?.numeroReporte || ''} — {avance?.proyectoId?.nombre || ''}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" size="small" startIcon={<Save />} onClick={handleSubmit} disabled={submitting}
              sx={{ bgcolor: 'rgba(0,150,255,0.25)', color: 'rgba(100,200,255,0.95)', border: '1px solid rgba(0,150,255,0.3)', '&:hover': { bgcolor: 'rgba(0,150,255,0.35)' } }}>
              {submitting ? 'Guardando...' : 'Guardar'}
            </Button>
            <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'rgba(255,255,255,0.9)', bgcolor: 'rgba(255,255,255,0.05)' } }}>
              <Close />
            </IconButton>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ p: 4 }}><LinearProgress /></Box>
        ) : error ? (
          <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>
        ) : avance ? (
          <Box sx={{ p: { xs: 1.5, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 2 }}>
              <Card sx={{ flex: '1 1 320px', minWidth: 280, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, p: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.55rem', fontWeight: 700, mb: 1.5, display: 'block' }}>Avance</Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>{field('Físico Parcial (%)', formData.avanceFisicoParcial, 'avanceFisicoParcial', { type: 'number' })}</Grid>
                  <Grid item xs={6}>{field('Físico Acumulado (%)', formData.avanceFisicoAcumulado, 'avanceFisicoAcumulado', { type: 'number' })}</Grid>
                  <Grid item xs={6}>{field('Financiero Parcial (%)', formData.avanceFinancieroParcial, 'avanceFinancieroParcial', { type: 'number' })}</Grid>
                  <Grid item xs={6}>{field('Financiero Acumulado (%)', formData.avanceFinancieroAcumulado, 'avanceFinancieroAcumulado', { type: 'number' })}</Grid>
                </Grid>
              </Card>

              <Card sx={{ flex: '1 1 280px', minWidth: 240, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, p: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.55rem', fontWeight: 700, mb: 1.5, display: 'block' }}>Estado</Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={12}>
                    <TextField select fullWidth size="small" label="Clima" value={formData.clima}
                      onChange={(e) => setFormData({ ...formData, clima: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.85)', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(100,180,255,0.3)' }, '&.Mui-focused fieldset': { borderColor: 'rgba(100,180,255,0.5)' } }, '& .MuiInputLabel-root': { color: 'rgba(150,200,255,0.5)', fontSize: '0.75rem' }, '& .MuiInputLabel-root.Mui-focused': { color: 'rgba(100,180,255,0.7)' }, '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.4)' } }}>
                      {['SOLEADO', 'NUBLADO', 'LLUVIA', 'GRANIZO', 'NIEBLA'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </TextField>
                  </Grid>
                  {(avance.estado === 'ENVIADO' || can(user, 'avances', 'update')) && (
                    <Grid item xs={12}>
                      <TextField select fullWidth size="small" label="Estado" value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.85)', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(100,180,255,0.3)' }, '&.Mui-focused fieldset': { borderColor: 'rgba(100,180,255,0.5)' } }, '& .MuiInputLabel-root': { color: 'rgba(150,200,255,0.5)', fontSize: '0.75rem' }, '& .MuiInputLabel-root.Mui-focused': { color: 'rgba(100,180,255,0.7)' }, '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.4)' } }}>
                        {['BORRADOR', 'ENVIADO', 'APROBADO', 'OBSERVADO'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                      </TextField>
                    </Grid>
                  )}
                </Grid>
              </Card>

              <Card sx={{ flex: '1 1 320px', minWidth: 280, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, p: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.55rem', fontWeight: 700, mb: 1.5, display: 'block' }}>Hito</Typography>
                {field('Descripción del Hito', formData.hitoDescripcion, 'hitoDescripcion')}
              </Card>

              <Card sx={{ flex: '1 1 400px', minWidth: 300, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, p: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.55rem', fontWeight: 700, mb: 1.5, display: 'block' }}>Actividades Realizadas</Typography>
                {field('', formData.actividadesRealizadas, 'actividadesRealizadas', { multiline: true, rows: 3 })}
              </Card>

              <Card sx={{ flex: '1 1 320px', minWidth: 260, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,180,0,0.15)', borderRadius: 2, p: 2 }}>
                <Typography variant="caption" color="warning.light" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.55rem', fontWeight: 700, mb: 1.5, display: 'block' }}>Problemas Identificados</Typography>
                {field('', formData.problemasIdentificados, 'problemasIdentificados', { multiline: true, rows: 2 })}
              </Card>
            </Box>

            {avance.fotos?.length > 0 && (
              <Card sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, p: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.55rem', fontWeight: 700, mb: 1, display: 'block' }}>
                  Evidencia Fotográfica ({avance.fotos.length})
                </Typography>
                <Grid container spacing={1.5}>
                  {avance.fotos.map((foto, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={idx}>
                      <Card sx={{ bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 1.5, overflow: 'hidden' }}>
                        <Box component="img" src={foto.url} alt={`Foto ${idx + 1}`}
                          sx={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />
                        <Box sx={{ px: 1, py: 0.8 }}>
                          <Box sx={{ display: 'flex', gap: 0.5, mb: 0.8, flexWrap: 'wrap' }}>
                            <Chip label={foto.verificacion?.estado || 'PENDIENTE'} size="small"
                              sx={{ fontWeight: 600, fontSize: '0.55rem', height: 18,
                                bgcolor: foto.verificacion?.estado === 'VERIFICADO' ? 'rgba(0,200,150,0.15)' : foto.verificacion?.estado === 'SOSPECHOSO' ? 'rgba(255,180,0,0.15)' : 'rgba(255,80,80,0.15)',
                                color: foto.verificacion?.estado === 'VERIFICADO' ? 'rgba(0,220,180,0.9)' : foto.verificacion?.estado === 'SOSPECHOSO' ? 'rgba(255,200,0,0.9)' : 'rgba(255,100,100,0.9)',
                                border: foto.verificacion?.estado === 'VERIFICADO' ? '1px solid rgba(0,220,180,0.2)' : foto.verificacion?.estado === 'SOSPECHOSO' ? '1px solid rgba(255,200,0,0.2)' : '1px solid rgba(255,80,80,0.2)' }} />
                            {foto.categoria && (
                              <Chip label={foto.categoria} size="small"
                                sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: 'rgba(150,200,255,0.6)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.5rem', height: 18 }} />
                            )}
                          </Box>
                          {foto.exif && (
                            <>
                              {foto.exif.dispositivo && (
                                <Typography variant="caption" sx={{ color: 'rgba(150,200,255,0.6)', fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                  <Smartphone sx={{ fontSize: 10 }} /> {foto.exif.dispositivo}{foto.exif.modeloCamara ? ' ' + foto.exif.modeloCamara : ''}
                                </Typography>
                              )}
                              {foto.exif.fechaCaptura && (
                                <Typography variant="caption" sx={{ color: 'rgba(150,200,255,0.6)', fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                  <AccessTime sx={{ fontSize: 10 }} /> {new Date(foto.exif.fechaCaptura).toLocaleString('es-BO')}
                                </Typography>
                              )}
                              {foto.exif.tieneGPS && foto.exif.latitud != null && (
                                <Typography variant="caption" sx={{ color: 'rgba(150,200,255,0.6)', fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                  <GpsFixed sx={{ fontSize: 10 }} /> {foto.exif.latitud.toFixed(6)}, {foto.exif.longitud?.toFixed(6)}
                                </Typography>
                              )}
                            </>
                          )}
                          {foto.verificacion?.distanciaObraMetros != null && (
                            <Box sx={{ mt: 0.3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOn sx={{ fontSize: 10, color: 'rgba(150,200,255,0.5)' }} />
                              <Typography variant="caption" sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.55rem' }}>
                                Distancia: {Math.round(foto.verificacion.distanciaObraMetros)}m
                              </Typography>
                              {foto.verificacion.ubicacionValida
                                ? <CheckCircle sx={{ fontSize: 10, color: 'rgba(0,220,180,0.7)' }} />
                                : <Warning sx={{ fontSize: 10, color: 'rgba(255,200,0,0.7)' }} />}
                            </Box>
                          )}
                          {foto.descripcion && (
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.6rem', display: 'block', mt: 0.3 }}>
                              {foto.descripcion}
                            </Typography>
                          )}
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            )}

            {submitError && (
              <Alert severity="error" sx={{ mt: 2, bgcolor: 'rgba(255,50,50,0.1)', color: 'rgba(255,100,100,0.9)', '& .MuiAlert-icon': { color: 'rgba(255,100,100,0.8)' } }}>
                {submitError}
              </Alert>
            )}
          </Box>
        ) : null}
      </Box>
    </Dialog>
  );
}
