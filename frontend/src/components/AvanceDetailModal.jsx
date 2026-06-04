import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Dialog, IconButton, LinearProgress, Alert, Card, CardContent, Grid, Chip,
  Button, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import { Close, GpsFixed, LocationOn, AccessTime, CameraAlt, Smartphone, CheckCircle, Warning, Cancel } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { can } from '../utils/permissions';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ESTADO_COLORS = {
  BORRADOR: 'default', ENVIADO: 'info', APROBADO: 'success', OBSERVADO: 'error',
};

const CLIMA_LABELS = {
  SOLEADO: 'Soleado', NUBLADO: 'Nublado', LLUVIA: 'Lluvia', GRANIZO: 'Granizo', NIEBLA: 'Niebla',
};

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

export default function AvanceDetailModal({ avanceId, onClose, onUpdate }) {
  const [avance, setAvance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [accion, setAccion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!avanceId) return;
    setLoading(true);
    api.get(`/avances/${avanceId}`)
      .then((res) => setAvance(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Error al cargar avance'))
      .finally(() => setLoading(false));
  }, [avanceId]);

  const canManage = can(user, 'avances', 'aprobar');

  const handleAprobarObservar = async () => {
    setSubmitting(true);
    try {
      const endpoint = accion === 'APROBAR' ? 'aprobar' : 'observar';
      await api.put(`/avances/${avanceId}/${endpoint}`, { observaciones });
      setSuccess(`Avance ${accion.toLowerCase()} correctamente`);
      setDialogOpen(false);
      onUpdate?.();
      const res = await api.get(`/avances/${avanceId}`);
      setAvance(res.data.data);
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

  const coordProyecto = avance?.proyectoId?.coordenadas?.lat && avance?.proyectoId?.coordenadas?.lng
    ? { lat: avance.proyectoId.coordenadas.lat, lng: avance.proyectoId.coordenadas.lng }
    : null;

  const ultimaFoto = avance?.fotos?.length > 0 ? avance.fotos[avance.fotos.length - 1] : null;
  const coordExif = ultimaFoto?.exif?.tieneGPS && ultimaFoto.exif.latitud != null
    ? { lat: ultimaFoto.exif.latitud, lng: ultimaFoto.exif.longitud }
    : null;

  return (
    <Dialog open={!!avanceId} onClose={onClose} fullScreen
      PaperProps={{
        sx: { bgcolor: '#0a0e27', backgroundImage: 'radial-gradient(ellipse at 20% 20%, rgba(0,100,200,0.08) 0%, transparent 60%)', color: 'rgba(255,255,255,0.9)' },
      }}>
      <Box sx={{ position: 'relative', height: '100%', overflow: 'auto' }}>
        {/* Header flotante */}
        <Box sx={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5, bgcolor: 'rgba(10,14,39,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
              {avance?.numeroReporte || 'Cargando...'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {avance?.proyectoId?.nombre || ''}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'rgba(255,255,255,0.9)', bgcolor: 'rgba(255,255,255,0.05)' } }}>
            <Close />
          </IconButton>
        </Box>

        {loading ? (
          <Box sx={{ p: 4 }}><LinearProgress /></Box>
        ) : error ? (
          <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>
        ) : avance ? (
          <Box sx={{ p: { xs: 1.5, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 2 }}>
              {/* Info card */}
              <Card sx={{ flex: '1 1 280px', minWidth: 280, bgcolor: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2 }}>
                <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.5rem' }}>Estado</Typography>
                      <Box sx={{ mt: 0.2 }}><Chip label={avance.estado} size="small" color={ESTADO_COLORS[avance.estado] || 'default'} sx={{ fontWeight: 600, fontSize: '0.6rem', height: 20 }} /></Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.5rem' }}>N° Reporte</Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: '0.75rem', mt: 0.2 }}>{avance.numeroReporte}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.5rem' }}>Av. Físico</Typography>
                      <Typography sx={{ color: 'rgba(100,200,255,0.9)', fontWeight: 600, fontSize: '0.85rem' }}>{avance.avanceFisicoAcumulado}%</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.5rem' }}>Av. Financiero</Typography>
                      <Typography sx={{ color: 'rgba(100,200,255,0.9)', fontWeight: 600, fontSize: '0.85rem' }}>{avance.avanceFinancieroAcumulado}%</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.5rem' }}>Fecha</Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500, fontSize: '0.75rem' }}>{new Date(avance.fechaReporte).toLocaleDateString('es-BO')}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.5rem' }}>Clima</Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500, fontSize: '0.75rem' }}>{CLIMA_LABELS[avance.clima] || avance.clima || '—'}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Mapa */}
              {(coordProyecto || coordExif) && (
                <Card sx={{ flex: '1 1 320px', minWidth: 280, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ height: 180 }}>
                    <MapContainer
                      center={[coordProyecto?.lat || coordExif.lat, coordProyecto?.lng || coordExif.lng]}
                      zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {coordProyecto && <Marker position={[coordProyecto.lat, coordProyecto.lng]} icon={blueIcon}><Popup>Proyecto</Popup></Marker>}
                      {coordExif && (!coordProyecto || coordExif.lat !== coordProyecto.lat || coordExif.lng !== coordProyecto.lng) && (
                        <Marker position={[coordExif.lat, coordExif.lng]} icon={redIcon}><Popup>Foto (EXIF)</Popup></Marker>
                      )}
                    </MapContainer>
                  </Box>
                  <Box sx={{ px: 1.5, py: 0.8, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    {coordProyecto && <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.55rem' }}><LocationOn sx={{ fontSize: 10, verticalAlign: 'middle', mr: 0.2 }} /> Proyecto: {coordProyecto.lat.toFixed(6)}, {coordProyecto.lng.toFixed(6)}</Typography>}
                    {coordExif && <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.55rem' }}><GpsFixed sx={{ fontSize: 10, verticalAlign: 'middle', mr: 0.2 }} /> Foto: {coordExif.lat.toFixed(6)}, {coordExif.lng.toFixed(6)}</Typography>}
                  </Box>
                </Card>
              )}

              {/* EXIF */}
              {ultimaFoto?.exif && (
                <Card sx={{ flex: '1 1 280px', minWidth: 240, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, p: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.55rem', fontWeight: 700, mb: 1, display: 'block' }}>Datos EXIF</Typography>
                  <Grid container spacing={1}>
                    {ultimaFoto.exif.dispositivo && (
                      <Grid item xs={6}><Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.5rem' }}>Dispositivo</Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem', fontWeight: 500 }}><Smartphone sx={{ fontSize: 11, verticalAlign: 'middle', mr: 0.2 }} />{ultimaFoto.exif.dispositivo}</Typography></Grid>
                    )}
                    {ultimaFoto.exif.fechaCaptura && (
                      <Grid item xs={6}><Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.5rem' }}>Captura</Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem', fontWeight: 500 }}><AccessTime sx={{ fontSize: 11, verticalAlign: 'middle', mr: 0.2 }} />{new Date(ultimaFoto.exif.fechaCaptura).toLocaleString('es-BO')}</Typography></Grid>
                    )}
                    {ultimaFoto.verificacion?.distanciaObraMetros != null && (
                      <Grid item xs={6}><Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.5rem' }}>Distancia</Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem', fontWeight: 500 }}>{Math.round(ultimaFoto.verificacion.distanciaObraMetros)}m
                          <Chip label={ultimaFoto.verificacion.ubicacionValida ? 'OK' : 'FUERA'} size="small" sx={{ ml: 0.5, fontSize: '0.45rem', height: 14, bgcolor: ultimaFoto.verificacion.ubicacionValida ? 'rgba(0,200,150,0.2)' : 'rgba(255,180,0,0.2)', color: ultimaFoto.verificacion.ubicacionValida ? 'rgba(0,220,180,0.9)' : 'rgba(255,200,0,0.9)' }} /></Typography></Grid>
                    )}
                    {(ultimaFoto.exif.latitud != null) && (
                      <Grid item xs={6}><Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.5rem' }}>Coordenadas</Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', fontWeight: 500, fontFamily: 'monospace' }}><CameraAlt sx={{ fontSize: 11, verticalAlign: 'middle', mr: 0.2 }} />{ultimaFoto.exif.latitud.toFixed(6)}, {ultimaFoto.exif.longitud?.toFixed(6)}</Typography></Grid>
                    )}
                  </Grid>
                </Card>
              )}

              {/* Actividades */}
              {avance.actividadesRealizadas && (
                <Card sx={{ flex: '1 1 320px', minWidth: 280, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, p: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.55rem', fontWeight: 700 }}>Actividades Realizadas</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', mt: 0.5 }}>{avance.actividadesRealizadas}</Typography>
                  {avance.hitoDescripcion && <Typography sx={{ color: 'rgba(150,200,255,0.6)', fontSize: '0.7rem', mt: 0.5 }}>Hito: {avance.hitoDescripcion}</Typography>}
                </Card>
              )}

              {/* Problemas */}
              {avance.problemasIdentificados && (
                <Card sx={{ flex: '1 1 280px', minWidth: 240, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,180,0,0.15)', borderRadius: 2, p: 2 }}>
                  <Typography variant="caption" color="warning.light" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.55rem', fontWeight: 700 }}>Problemas</Typography>
                  <Typography sx={{ color: 'rgba(255,200,100,0.85)', fontSize: '0.8rem', mt: 0.5 }}>{avance.problemasIdentificados}</Typography>
                </Card>
              )}

              {/* Observaciones */}
              {avance.observacionesSupervisor && (
                <Card sx={{ flex: '1 1 280px', minWidth: 240, bgcolor: 'rgba(255,80,80,0.06)', border: '1px solid rgba(255,80,80,0.15)', borderRadius: 2, p: 2 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,100,100,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.55rem', fontWeight: 700 }}>Observaciones</Typography>
                  <Typography sx={{ color: 'rgba(255,150,150,0.9)', fontSize: '0.8rem', mt: 0.5 }}>{avance.observacionesSupervisor}</Typography>
                </Card>
              )}
            </Box>

            {/* Fotos */}
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
                          sx={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
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
                    </Grid>
                  ))}
                </Grid>
              </Card>
            )}

            {success && <Alert severity="success" sx={{ mt: 2, bgcolor: 'rgba(0,200,150,0.1)', color: 'rgba(0,220,180,0.9)' }}>{success}</Alert>}

            {canManage && avance.estado === 'ENVIADO' && (
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button fullWidth variant="contained" startIcon={<CheckCircle />}
                  sx={{ bgcolor: 'rgba(0,200,150,0.3)', color: 'rgba(0,220,180,0.95)', border: '1px solid rgba(0,220,180,0.3)', '&:hover': { bgcolor: 'rgba(0,200,150,0.5)' } }}
                  onClick={() => openDialog('APROBAR')}>
                  Aprobar Avance
                </Button>
                <Button fullWidth variant="contained" startIcon={<Cancel />}
                  sx={{ bgcolor: 'rgba(255,80,80,0.3)', color: 'rgba(255,120,120,0.95)', border: '1px solid rgba(255,80,80,0.3)', '&:hover': { bgcolor: 'rgba(255,80,80,0.5)' } }}
                  onClick={() => openDialog('OBSERVAR')}>
                  Observar Avance
                </Button>
              </Box>
            )}

            {/* Approve/Observe Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
              PaperProps={{
                sx: { bgcolor: 'rgba(10,14,39,0.95)', backdropFilter: 'blur(24px)', border: '1px solid rgba(100,180,255,0.12)', borderRadius: 3, boxShadow: '0 8px 60px rgba(0,0,0,0.7)' },
              }}>
              <DialogTitle sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: '1rem' }}>
                {accion === 'APROBAR' ? 'Aprobar Avance' : 'Observar Avance'}
              </DialogTitle>
              <DialogContent>
                <TextField fullWidth multiline rows={3} label="Observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder={accion === 'APROBAR' ? 'Comentario opcional...' : 'Describe las observaciones...'}
                  sx={{ mt: 1, '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.85)', borderRadius: 1.5, '& fieldset': { border: '1px solid rgba(255,255,255,0.1)' } }, '& .MuiInputLabel-root': { color: 'rgba(150,200,255,0.5)', fontSize: '0.8rem' } }} />
                {error && <Alert severity="error" sx={{ mt: 2, bgcolor: 'rgba(255,50,50,0.1)', color: 'rgba(255,100,100,0.9)' }}>{error}</Alert>}
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={() => setDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'rgba(255,255,255,0.8)' } }}>
                  Cancelar
                </Button>
                <Button variant="contained" onClick={handleAprobarObservar} disabled={submitting}
                  sx={{ bgcolor: accion === 'APROBAR' ? 'rgba(0,200,150,0.3)' : 'rgba(255,80,80,0.3)', color: accion === 'APROBAR' ? 'rgba(0,220,180,0.95)' : 'rgba(255,120,120,0.95)', border: `1px solid ${accion === 'APROBAR' ? 'rgba(0,220,180,0.3)' : 'rgba(255,80,80,0.3)'}`, '&:hover': { bgcolor: accion === 'APROBAR' ? 'rgba(0,200,150,0.5)' : 'rgba(255,80,80,0.5)' } }}>
                  {submitting ? 'Procesando...' : accion === 'APROBAR' ? 'Aprobar' : 'Observar'}
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        ) : null}
      </Box>
    </Dialog>
  );
}
