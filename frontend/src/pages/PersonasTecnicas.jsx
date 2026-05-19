import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, IconButton, Tooltip, Alert } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../services/api';

const ROLES = ['SUPERVISOR', 'INSPECTOR', 'FISCAL', 'FISCALIZADOR', 'JEFE_PROYECTO'];
const ESPECIALIDADES = ['CAMINOS', 'PUENTES', 'ELECTRIFICACION', 'AGUA_POTABLE', 'SANEAMIENTO', 'EDIFICACION', 'GENERAL'];

const PersonasTecnicas = () => {
  const [personas, setPersonas] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    nombreCompleto: '', ci: '', profesion: '', matriculaProfesional: '',
    rol: 'SUPERVISOR', especialidad: 'GENERAL', telefono: '', email: '',
    institucion: '', cargo: '', habilitado: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchPersonas(); }, []);

  const fetchPersonas = async () => {
    try {
      const res = await api.get('/gestion/personas-tecnicas');
      setPersonas(res.data.data);
    } catch (err) {
      setError('Error al cargar personas técnicas');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (persona = null) => {
    if (persona) {
      setEditMode(true);
      setEditId(persona._id);
      setFormData({
        nombreCompleto: persona.nombreCompleto || '',
        ci: persona.ci || '',
        profesion: persona.profesion || '',
        matriculaProfesional: persona.matriculaProfesional || '',
        rol: persona.rol || 'SUPERVISOR',
        especialidad: persona.especialidad || 'GENERAL',
        telefono: persona.telefono || '',
        email: persona.email || '',
        institucion: persona.institucion || '',
        cargo: persona.cargo || '',
        habilitado: persona.habilitado ?? true,
      });
    } else {
      setEditMode(false);
      setEditId(null);
      setFormData({
        nombreCompleto: '', ci: '', profesion: '', matriculaProfesional: '',
        rol: 'SUPERVISOR', especialidad: 'GENERAL', telefono: '', email: '',
        institucion: '', cargo: '', habilitado: true,
      });
    }
    setError(null);
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        const res = await api.put(`/gestion/personas-tecnicas/${editId}`, formData);
        setPersonas(personas.map(p => p._id === editId ? res.data.data : p));
      } else {
        const res = await api.post('/gestion/personas-tecnicas', formData);
        setPersonas([...personas, res.data.data]);
      }
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/gestion/personas-tecnicas/${deleteConfirm._id}`);
      setPersonas(personas.filter(p => p._id !== deleteConfirm._id));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Error al eliminar');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Personas Técnicas</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Nueva Persona</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? <Typography>Cargando...</Typography> : personas.length === 0 ? (
        <Card><CardContent><Typography color="text.secondary">No hay personas técnicas registradas</Typography></CardContent></Card>
      ) : (
        <Grid container spacing={2}>
          {personas.map((p) => (
            <Grid item xs={12} sm={6} md={4} key={p._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{p.nombreCompleto}</Typography>
                      <Typography variant="body2" color="text.secondary">CI: {p.ci}</Typography>
                      {p.profesion && <Typography variant="body2" color="text.secondary">{p.profesion}</Typography>}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Editar"><IconButton size="small" onClick={() => handleOpen(p)}><Edit fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={() => setDeleteConfirm(p)}><Delete fontSize="small" /></IconButton></Tooltip>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Chip label={p.rol} size="small" color="primary" />
                    <Chip label={p.especialidad} size="small" />
                  </Box>
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {p.matriculaProfesional && <Typography variant="caption">Mat: {p.matriculaProfesional}</Typography>}
                    <Chip label={p.habilitado ? 'Habilitado' : 'Deshabilitado'} size="small" color={p.habilitado ? 'success' : 'error'} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog Crear/Editar */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Editar Persona Técnica' : 'Nueva Persona Técnica'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nombre Completo *" size="small" sx={{ mb: 2, mt: 1 }} required
            value={formData.nombreCompleto} onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })} />
          <TextField fullWidth label="CI *" size="small" sx={{ mb: 2 }} required
            value={formData.ci} onChange={(e) => setFormData({ ...formData, ci: e.target.value })} />
          <TextField fullWidth label="Profesión" size="small" sx={{ mb: 2 }}
            value={formData.profesion} onChange={(e) => setFormData({ ...formData, profesion: e.target.value })} />
          <TextField fullWidth label="Matrícula Profesional" size="small" sx={{ mb: 2 }}
            value={formData.matriculaProfesional} onChange={(e) => setFormData({ ...formData, matriculaProfesional: e.target.value })} />
          <TextField select fullWidth label="Rol *" size="small" sx={{ mb: 2 }} required
            value={formData.rol} onChange={(e) => setFormData({ ...formData, rol: e.target.value })}>
            {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>
          <TextField select fullWidth label="Especialidad" size="small" sx={{ mb: 2 }}
            value={formData.especialidad} onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}>
            {ESPECIALIDADES.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Teléfono" size="small" sx={{ mb: 2 }}
            value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
          <TextField fullWidth label="Email" size="small" sx={{ mb: 2 }}
            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <TextField fullWidth label="Institución" size="small" sx={{ mb: 2 }}
            value={formData.institucion} onChange={(e) => setFormData({ ...formData, institucion: e.target.value })} />
          <TextField fullWidth label="Cargo" size="small" sx={{ mb: 2 }}
            value={formData.cargo} onChange={(e) => setFormData({ ...formData, cargo: e.target.value })} />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!formData.nombreCompleto || !formData.ci}>
            {editMode ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Confirmar Eliminación */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de eliminar <strong>{deleteConfirm?.nombreCompleto}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PersonasTecnicas;
