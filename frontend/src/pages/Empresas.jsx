import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, IconButton, Tooltip, Alert } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../services/api';

const ESPECIALIDADES = ['CAMINOS', 'PUENTES', 'ELECTRIFICACION', 'AGUA_POTABLE', 'SANEAMIENTO', 'EDIFICACION', 'GENERAL'];
const CATEGORIAS = ['PEQUEÑA', 'MEDIANA', 'GRANDE'];

const Empresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '', nit: '', representanteLegal: '', ciRepresentante: '',
    especialidades: [], categoria: 'MEDIANA', registroSICOPI: '',
    direccion: '', telefono: '', email: '', habilitado: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchEmpresas(); }, []);

  const fetchEmpresas = async () => {
    try {
      const res = await api.get('/gestion/empresas');
      setEmpresas(res.data.data);
    } catch (err) {
      setError('Error al cargar empresas');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (empresa = null) => {
    if (empresa) {
      setEditMode(true);
      setEditId(empresa._id);
      setFormData({
        nombre: empresa.nombre || '',
        nit: empresa.nit || '',
        representanteLegal: empresa.representanteLegal || '',
        ciRepresentante: empresa.ciRepresentante || '',
        especialidades: empresa.especialidades || [],
        categoria: empresa.categoria || 'MEDIANA',
        registroSICOPI: empresa.registroSICOPI || '',
        direccion: empresa.direccion || '',
        telefono: empresa.telefono || '',
        email: empresa.email || '',
        habilitado: empresa.habilitado ?? true,
      });
    } else {
      setEditMode(false);
      setEditId(null);
      setFormData({
        nombre: '', nit: '', representanteLegal: '', ciRepresentante: '',
        especialidades: [], categoria: 'MEDIANA', registroSICOPI: '',
        direccion: '', telefono: '', email: '', habilitado: true,
      });
    }
    setError(null);
    setOpen(true);
  };

  const toggleEspecialidad = (esp) => {
    setFormData({
      ...formData,
      especialidades: formData.especialidades.includes(esp)
        ? formData.especialidades.filter(e => e !== esp)
        : [...formData.especialidades, esp],
    });
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        const res = await api.put(`/gestion/empresas/${editId}`, formData);
        setEmpresas(empresas.map(e => e._id === editId ? res.data.data : e));
      } else {
        const res = await api.post('/gestion/empresas', formData);
        setEmpresas([...empresas, res.data.data]);
      }
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/gestion/empresas/${deleteConfirm._id}`);
      setEmpresas(empresas.filter(e => e._id !== deleteConfirm._id));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Error al eliminar');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Empresas Constructoras</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Nueva Empresa</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? <Typography>Cargando...</Typography> : empresas.length === 0 ? (
        <Card><CardContent><Typography color="text.secondary">No hay empresas registradas</Typography></CardContent></Card>
      ) : (
        <Grid container spacing={2}>
          {empresas.map((e) => (
            <Grid item xs={12} sm={6} md={4} key={e._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{e.nombre}</Typography>
                      <Typography variant="body2" color="text.secondary">NIT: {e.nit}</Typography>
                      {e.representanteLegal && <Typography variant="body2" color="text.secondary">{e.representanteLegal}</Typography>}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Editar"><IconButton size="small" onClick={() => handleOpen(e)}><Edit fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={() => setDeleteConfirm(e)}><Delete fontSize="small" /></IconButton></Tooltip>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {e.especialidades?.map((esp) => <Chip key={esp} label={esp} size="small" />)}
                  </Box>
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip label={e.categoria} size="small" color="secondary" />
                    <Chip label={e.habilitado ? 'Habilitada' : 'Deshabilitada'} size="small" color={e.habilitado ? 'success' : 'error'} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog Crear/Editar */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Editar Empresa' : 'Nueva Empresa'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nombre *" size="small" sx={{ mb: 2, mt: 1 }} required
            value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
          <TextField fullWidth label="NIT *" size="small" sx={{ mb: 2 }} required
            value={formData.nit} onChange={(e) => setFormData({ ...formData, nit: e.target.value })} />
          <TextField fullWidth label="Representante Legal" size="small" sx={{ mb: 2 }}
            value={formData.representanteLegal} onChange={(e) => setFormData({ ...formData, representanteLegal: e.target.value })} />
          <TextField fullWidth label="CI Representante" size="small" sx={{ mb: 2 }}
            value={formData.ciRepresentante} onChange={(e) => setFormData({ ...formData, ciRepresentante: e.target.value })} />
          <TextField select fullWidth label="Categoría" size="small" sx={{ mb: 2 }}
            value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}>
            {CATEGORIAS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Registro SICOPI" size="small" sx={{ mb: 2 }}
            value={formData.registroSICOPI} onChange={(e) => setFormData({ ...formData, registroSICOPI: e.target.value })} />
          <TextField fullWidth label="Dirección" size="small" sx={{ mb: 2 }}
            value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} />
          <TextField fullWidth label="Teléfono" size="small" sx={{ mb: 2 }}
            value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
          <TextField fullWidth label="Email" size="small" sx={{ mb: 2 }}
            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>Especialidades</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {ESPECIALIDADES.map(esp => (
              <Chip key={esp} label={esp} clickable
                color={formData.especialidades.includes(esp) ? 'primary' : 'default'}
                onClick={() => toggleEspecialidad(esp)} />
            ))}
          </Box>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!formData.nombre || !formData.nit}>
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

export default Empresas;
