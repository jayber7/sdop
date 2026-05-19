import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, LinearProgress, Alert,
} from '@mui/material';
import {
  BugReport, Lightbulb, Build, HelpOutline,
  CheckCircle, HourglassEmpty, Cancel, Reply, Refresh,
} from '@mui/icons-material';
import api from '../services/api';

const TIPO_CONFIG = {
  BUG: { label: 'Bug', icon: <BugReport />, color: 'error' },
  MEJORA: { label: 'Mejora', icon: <Lightbulb />, color: 'warning' },
  NUEVA_FUNCIONALIDAD: { label: 'Nueva Func.', icon: <Build />, color: 'info' },
  OTRO: { label: 'Otro', icon: <HelpOutline />, color: 'default' },
};

const ESTADO_CONFIG = {
  ABIERTO: { label: 'Abierto', color: 'info' },
  EN_PROGRESO: { label: 'En Progreso', color: 'warning' },
  RESUELTO: { label: 'Resuelto', color: 'success' },
  CERRADO: { label: 'Cerrado', color: 'default' },
  RECHAZADO: { label: 'Rechazado', color: 'error' },
};

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ estado: '', tipo: '' });
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [respuesta, setRespuesta] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feedbacksRes, statsRes] = await Promise.all([
        api.get('/feedback', { params: { ...filter, limit: 50 } }),
        api.get('/feedback/stats'),
      ]);
      setFeedbacks(feedbacksRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error('Error loading feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponder = async () => {
    try {
      await api.put(`/feedback/${selectedFeedback._id}`, {
        estado: nuevoEstado || selectedFeedback.estado,
        respuesta,
      });
      setSuccess('Feedback actualizado correctamente');
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar');
    }
  };

  const openDialog = (feedback) => {
    setSelectedFeedback(feedback);
    setNuevoEstado(feedback.estado);
    setRespuesta(feedback.respuesta || '');
    setDialogOpen(true);
    setError(null);
  };

  if (loading) return <Box sx={{ p: 3 }}><LinearProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Feedback de Usuarios</Typography>
        <Tooltip title="Actualizar">
          <IconButton onClick={fetchData}><Refresh /></IconButton>
        </Tooltip>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: 'info.lighter' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {stats.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">Total</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: 'warning.lighter' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {stats.abiertos || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">Abiertos</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: 'success.lighter' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {stats.resueltos || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">Resueltos</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: 'grey.100' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {Object.entries(stats.porTipo || {}).map(([tipo, count]) => (
                  <Chip key={tipo} label={`${TIPO_CONFIG[tipo]?.label}: ${count}`} size="small" sx={{ m: 0.5 }} />
                ))}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Por Tipo</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          select
          size="small"
          label="Estado"
          value={filter.estado}
          onChange={(e) => setFilter({ ...filter, estado: e.target.value })}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(ESTADO_CONFIG).map(([key, val]) => (
            <MenuItem key={key} value={key}>{val.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Tipo"
          value={filter.tipo}
          onChange={(e) => setFilter({ ...filter, tipo: e.target.value })}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(TIPO_CONFIG).map(([key, val]) => (
            <MenuItem key={key} value={key}>{val.label}</MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell><strong>Tipo</strong></TableCell>
              <TableCell><strong>Título</strong></TableCell>
              <TableCell><strong>Usuario</strong></TableCell>
              <TableCell><strong>Página</strong></TableCell>
              <TableCell><strong>Prioridad</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell><strong>Fecha</strong></TableCell>
              <TableCell align="center"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>No hay feedback registrado</Typography>
                </TableCell>
              </TableRow>
            ) : (
              feedbacks.map((fb) => (
                <TableRow key={fb._id} hover>
                  <TableCell>
                    <Chip
                      size="small"
                      icon={TIPO_CONFIG[fb.tipo]?.icon}
                      label={TIPO_CONFIG[fb.tipo]?.label}
                      color={TIPO_CONFIG[fb.tipo]?.color}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 250, fontWeight: 600 }} noWrap>
                      {fb.titulo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{fb.usuarioId?.nombre || 'N/A'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">{fb.pagina}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={fb.prioridad}
                      color={fb.prioridad === 'URGENTE' ? 'error' : fb.prioridad === 'ALTA' ? 'warning' : fb.prioridad === 'MEDIA' ? 'info' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={ESTADO_CONFIG[fb.estado]?.label}
                      color={ESTADO_CONFIG[fb.estado]?.color}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(fb.createdAt).toLocaleDateString('es-BO')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Responder">
                      <IconButton size="small" onClick={() => openDialog(fb)}>
                        <Reply fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Reply color="primary" />
            Responder Feedback
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedFeedback && (
            <Box sx={{ py: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  size="small"
                  icon={TIPO_CONFIG[selectedFeedback.tipo]?.icon}
                  label={TIPO_CONFIG[selectedFeedback.tipo]?.label}
                  color={TIPO_CONFIG[selectedFeedback.tipo]?.color}
                />
                <Chip
                  size="small"
                  label={selectedFeedback.prioridad}
                  color={selectedFeedback.prioridad === 'URGENTE' ? 'error' : 'default'}
                />
              </Box>

              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {selectedFeedback.titulo}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {selectedFeedback.descripcion}
              </Typography>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Por: {selectedFeedback.usuarioId?.nombre} - {selectedFeedback.pagina}
              </Typography>

              <TextField
                select
                fullWidth
                size="small"
                label="Cambiar Estado"
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value)}
                sx={{ mb: 2 }}
              >
                {Object.entries(ESTADO_CONFIG).map(([key, val]) => (
                  <MenuItem key={key} value={key}>{val.label}</MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                size="small"
                label="Respuesta (opcional)"
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                multiline
                rows={3}
                placeholder="Escribe una respuesta al usuario..."
              />

              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleResponder}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackList;
