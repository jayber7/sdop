import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Box, IconButton, Alert, Stack, Chip as MuiChip,
} from '@mui/material';
import { Add, Edit, Delete, Block, CheckCircle, Visibility, VisibilityOff } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ROLES = ['ADMIN', 'SUPERVISOR', 'INSPECTOR', 'FISCAL', 'VISOR'];

const Usuarios = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nombre: '', email: '', password: '', rol: 'VISOR', unidadesAcceso: [],
  });

  useEffect(() => {
    fetchUsuarios();
    fetchUnidades();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await api.get('/gestion/usuarios');
      setUsuarios(res.data.data || []);
    } catch (err) {
      console.error('Error fetching usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnidades = async () => {
    try {
      const res = await api.get('/unidades');
      setUnidades(res.data.data || []);
    } catch (err) {
      console.error('Error fetching unidades:', err);
    }
  };

  const handleOpenDialog = (usuario = null) => {
    if (usuario) {
      setSelectedUser(usuario);
      setFormData({
        nombre: usuario.nombre,
        email: usuario.email,
        password: '',
        rol: usuario.rol,
        unidadesAcceso: usuario.unidadesAcceso?.map(u => u._id) || [],
      });
    } else {
      setSelectedUser(null);
      setFormData({ nombre: '', email: '', password: '', rol: 'VISOR', unidadesAcceso: [] });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    try {
      if (selectedUser) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await api.put(`/gestion/usuarios/${selectedUser.id}`, updateData);
        setSuccess('Usuario actualizado');
      } else {
        await api.post('/gestion/usuarios', formData);
        setSuccess('Usuario creado');
      }
      handleCloseDialog();
      fetchUsuarios();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleToggleActivo = async (usuario) => {
    try {
      await api.put(`/gestion/usuarios/${usuario.id}/activar`, { activo: !usuario.activo });
      fetchUsuarios();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/gestion/usuarios/${selectedUser.id}`);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsuarios();
      setSuccess('Usuario eliminado');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const getRolColor = (rol) => {
    const colors = { ADMIN: 'error', SUPERVISOR: 'primary', INSPECTOR: 'info', FISCAL: 'warning', VISOR: 'default' };
    return colors[rol] || 'default';
  };

  if (user?.rol !== 'ADMIN') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">No tienes permiso para acceder a esta página</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Gestión de Usuarios</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Nuevo Usuario
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Unidades</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id} sx={{ opacity: u.activo ? 1 : 0.5 }}>
                <TableCell>{u.nombre}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell><Chip label={u.rol} size="small" color={getRolColor(u.rol)} /></TableCell>
                <TableCell>
                  {(u.unidadesAcceso || []).map((unidad) => (
                    <MuiChip key={unidad._id} label={unidad.codigo} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </TableCell>
                <TableCell>
                  <Chip label={u.activo ? 'Activo' : 'Inactivo'} size="small" color={u.activo ? 'success' : 'error'} />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleOpenDialog(u)}><Edit /></IconButton>
                  <IconButton size="small" onClick={() => handleToggleActivo(u)}>
                    {u.activo ? <Block /> : <CheckCircle />}
                  </IconButton>
                  <IconButton size="small" onClick={() => { setSelectedUser(u); setDeleteDialogOpen(true); }}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Nombre" fullWidth value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
            <TextField label="Email" type="email" fullWidth value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
              required disabled={!!selectedUser} />
            <TextField label={selectedUser ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña'}
              type={showPassword ? 'text' : 'password'} fullWidth value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!selectedUser}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }} />
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select value={formData.rol} label="Rol"
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}>
                {ROLES.map((rol) => <MenuItem key={rol} value={rol}>{rol}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Unidades de Acceso</InputLabel>
              <Select multiple value={formData.unidadesAcceso} label="Unidades de Acceso"
                onChange={(e) => setFormData({ ...formData, unidadesAcceso: e.target.value })}>
                {unidades.map((u) => <MenuItem key={u._id} value={u._id}>{u.nombre}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.nombre || !formData.email || (!selectedUser && !formData.password)}>
            {selectedUser ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Está seguro de eliminar al usuario <strong>{selectedUser?.nombre}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Usuarios;
