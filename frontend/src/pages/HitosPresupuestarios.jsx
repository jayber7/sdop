import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, IconButton, Tooltip, Alert, LinearProgress } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../services/api';

const ESTADOS = ['PENDIENTE', 'EN_EJECUCION', 'COMPLETADO', 'CANCELADO'];

const HitosPresupuestarios = () => {
  const [hitos, setHitos] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    proyectoId: '', nombre: '', descripcion: '', avanceFisicoMinimo: 0,
    montoAsociado: 0, estado: 'PENDIENTE', fechaProgramada: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchHitos();
    fetchProyectos();
  }, []);

  const fetchHitos = async () => {
    try {
      const res = await api.get('/gestion/hitos');
      setHitos(res.data.data);
    } catch (err) {
      setError('Error al cargar hitos');
    } finally {
      setLoading(false);
    }
  };

  const fetchProyectos = async () => {
    try {
      const res = await api.get('/gestion/proyectos');
      setProyectos(res.data.data);
    } catch (err) {
      console.error('Error al cargar proyectos', err);
    }
  };

  const handleOpen = (hito = null) => {
    if (hito) {
      setEditMode(true);
      setEditId(hito._id);
      setFormData({
        proyectoId: hito.proyectoId?._id || hito.proyectoId || '',
        nombre: hito.nombre || '',
        descripcion: hito.descripcion || '',
        avanceFisicoMinimo: hito.avanceFisicoMinimo || 0,
        montoAsociado: hito.montoAsociado || 0,
        estado: hito.estado || 'PENDIENTE',
        fechaProgramada: hito.fechaProgramada ? new Date(hito.fechaProgramada).toISOString().split('T')[0] : '',
      });
    } else {
      setEditMode(false);
      setEditId(null);
      setFormData({
        proyectoId: '', nombre: '', descripcion: '', avanceFisicoMinimo: 0,
        montoAsociado: 0, estado: 'PENDIENTE', fechaProgramada: '',
      });
    }
    setError(null);
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        const res = await api.put(`/gestion/hitos/${editId}`, formData);
        setHitos(hitos.map(h => h._id === editId ? res.data.data : h));
      } else {
        const res = await api.post('/gestion/hitos', formData);
        setHitos([...hitos, res.data.data]);
      }
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/gestion/hitos/${deleteConfirm._id}`);
      setHitos(hitos.filter(h => h._id !== deleteConfirm._id));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Error al eliminar');
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'COMPLETADO': return 'success';
      case 'EN_EJECUCION': return 'primary';
      case 'CANCELADO': return 'error';
      default: return 'warning';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Hitos Presupuestarios</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Nuevo Hito</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? <Typography>Cargando...</Typography> : hitos.length === 0 ? (
        <Card><CardContent><Typography color="text.secondary">No hay hitos registrados</Typography></CardContent></Card>
      ) : (
        <Grid container spacing={2}>
          {hitos.map((h) => (
            <Grid item xs={12} sm={6} md={4} key={h._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{h.nombre}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {h.proyectoId?.nombre || 'Sin proyecto'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Editar"><IconButton size="small" onClick={() => handleOpen(h)}><Edit fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={() => setDeleteConfirm(h)}><Delete fontSize="small" /></IconButton></Tooltip>
                    </Box>
                  </Box>
                  {h.descripcion && <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>{h.descripcion}</Typography>}
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption">Avance físico mínimo</Typography>
                      <Typography variant="caption">{h.avanceFisicoMinimo}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={h.avanceFisicoMinimo} sx={{ mb: 1 }} />
                  </Box>
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Bs. {Number(h.montoAsociado).toLocaleString('es-BO')}
                    </Typography>
                    <Chip label={h.estado} size="small" color={getEstadoColor(h.estado)} />
                  </Box>
                  {h.fechaProgramada && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Programado: {new Date(h.fechaProgramada).toLocaleDateString('es-BO')}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog Crear/Editar */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Editar Hito' : 'Nuevo Hito Presupuestario'}</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Proyecto *" size="small" sx={{ mb: 2, mt: 1 }} required
            value={formData.proyectoId} onChange={(e) => setFormData({ ...formData, proyectoId: e.target.value })}>
            <MenuItem value="">Seleccionar proyecto...</MenuItem>
            {proyectos.map(p => <MenuItem key={p._id} value={p._id}>{p.nombre}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Nombre del Hito *" size="small" sx={{ mb: 2 }} required
            value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
          <TextField fullWidth label="Descripción" size="small" sx={{ mb: 2 }} multiline rows={2}
            value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} />
          <TextField fullWidth label="Avance Físico Mínimo (%)" size="small" sx={{ mb: 2 }} type="number"
            InputProps={{ inputProps: { min: 0, max: 100 } }}
            value={formData.avanceFisicoMinimo} onChange={(e) => setFormData({ ...formData, avanceFisicoMinimo: Number(e.target.value) })} />
          <TextField fullWidth label="Monto Asociado (Bs.)" size="small" sx={{ mb: 2 }} type="number"
            InputProps={{ inputProps: { min: 0 } }}
            value={formData.montoAsociado} onChange={(e) => setFormData({ ...formData, montoAsociado: Number(e.target.value) })} />
          <TextField select fullWidth label="Estado" size="small" sx={{ mb: 2 }}
            value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })}>
            {ESTADOS.map(e => <MenuItem key={e} value={e}>{e.replace('_', ' ')}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Fecha Programada" size="small" sx={{ mb: 2 }} type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.fechaProgramada} onChange={(e) => setFormData({ ...formData, fechaProgramada: e.target.value })} />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!formData.proyectoId || !formData.nombre}>
            {editMode ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Confirmar Eliminación */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de eliminar <strong>{deleteConfirm?.nombre}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HitosPresupuestarios;
