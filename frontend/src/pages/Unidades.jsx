import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Alert,
} from '@mui/material';
import { Add, Edit, Delete, Save } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Unidades = () => {
  const { user } = useAuth();
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '', codigo: '', descripcion: '', color: '#1976d2', icono: '',
  });

  const fetchUnidades = async () => {
    try {
      const res = await api.get('/unidades');
      setUnidades(res.data.data);
    } catch (err) {
      setError('Error al cargar unidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUnidades(); }, []);

  const handleOpenDialog = (unidad = null) => {
    setEditing(unidad);
    setFormData(unidad ? {
      nombre: unidad.nombre, codigo: unidad.codigo, descripcion: unidad.descripcion || '',
      color: unidad.color || '#1976d2', icono: unidad.icono || '',
    } : { nombre: '', codigo: '', descripcion: '', color: '#1976d2', icono: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => { setOpenDialog(false); setEditing(null); setError(null); };

  const handleSubmit = async () => {
    setError(null);
    try {
      if (editing) {
        await api.put(`/unidades/${editing._id}`, formData);
      } else {
        await api.post('/unidades', formData);
      }
      setSuccess(true);
      setTimeout(() => { setSuccess(false); handleCloseDialog(); fetchUnidades(); }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta unidad?')) return;
    try {
      await api.delete(`/unidades/${id}`);
      fetchUnidades();
    } catch (err) {
      setError('Error al eliminar');
    }
  };

  if (loading) return <Box sx={{ p: 3 }}><Typography>Cargando...</Typography></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Unidades Organizativas</Typography>
        {user?.rol === 'ADMIN' && (
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Nueva Unidad</Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Operación exitosa</Alert>}

      <Grid container spacing={2}>
        {unidades.map((u) => (
          <Grid item xs={12} sm={6} md={4} key={u._id}>
            <Card sx={{ borderLeft: `4px solid ${u.color || '#1976d2'}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Chip label={u.codigo} size="small" sx={{ bgcolor: `${u.color}22`, color: u.color, fontWeight: 700, mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{u.nombre}</Typography>
                    {u.descripcion && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{u.descripcion}</Typography>}
                    {u.jefeId && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Jefe: {u.jefeId.nombreCompleto}
                      </Typography>
                    )}
                  </Box>
                  {user?.rol === 'ADMIN' && (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => handleOpenDialog(u)}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(u._id)}><Delete fontSize="small" /></IconButton>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {unidades.length === 0 && (
          <Grid item xs={12}>
            <Card><CardContent><Typography color="text.secondary">No hay unidades registradas</Typography></CardContent></Card>
          </Grid>
        )}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Editar Unidad' : 'Nueva Unidad'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField fullWidth size="small" label="Nombre *" required sx={{ mb: 2 }}
              value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
            <TextField fullWidth size="small" label="Código *" required sx={{ mb: 2 }}
              value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })} />
            <TextField fullWidth size="small" label="Descripción" multiline rows={2} sx={{ mb: 2 }}
              value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} />
            <TextField fullWidth size="small" label="Color" type="color" sx={{ mb: 2 }}
              value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
            <TextField fullWidth size="small" label="Ícono (nombre MUI)" sx={{ mb: 2 }}
              value={formData.icono} onChange={(e) => setFormData({ ...formData, icono: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" startIcon={<Save />} onClick={handleSubmit}
            disabled={!formData.nombre || !formData.codigo}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Unidades;
