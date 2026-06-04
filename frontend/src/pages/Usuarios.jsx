import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Box, IconButton, Alert, Stack, Chip as MuiChip,
  Accordion, AccordionSummary, AccordionDetails, Checkbox, FormControlLabel, FormGroup,
} from '@mui/material';
import { Add, Edit, Delete, Block, CheckCircle, Visibility, VisibilityOff, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { can, getDefaultPermissions, RESOURCE_ACTIONS } from '../utils/permissions';

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
  const [customPermisos, setCustomPermisos] = useState(false);
  const [permisosOverrides, setPermisosOverrides] = useState({});

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
      const userPerms = usuario.permisos || {};
      setPermisosOverrides(userPerms);
      setCustomPermisos(Object.keys(userPerms).length > 0);
    } else {
      setSelectedUser(null);
      setFormData({ nombre: '', email: '', password: '', rol: 'VISOR', unidadesAcceso: [] });
      setPermisosOverrides({});
      setCustomPermisos(false);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setCustomPermisos(false);
    setPermisosOverrides({});
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    try {
      const payload = { ...formData };
      if (customPermisos) {
        payload.permisos = permisosOverrides;
      } else {
        payload.permisos = {};
      }
      if (selectedUser) {
        if (!payload.password) delete payload.password;
        await api.put(`/gestion/usuarios/${selectedUser._id}`, payload);
        setSuccess('Usuario actualizado');
      } else {
        await api.post('/gestion/usuarios', payload);
        setSuccess('Usuario creado');
      }
      handleCloseDialog();
      fetchUsuarios();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const togglePermiso = (resource, action) => {
    setPermisosOverrides((prev) => {
      const current = [...(prev[resource] || [])];
      const idx = current.indexOf(action);
      if (idx >= 0) {
        current.splice(idx, 1);
      } else {
        current.push(action);
      }
      return { ...prev, [resource]: current };
    });
  };

  const handleToggleActivo = async (usuario) => {
    try {
      await api.put(`/gestion/usuarios/${usuario._id}/activar`, { activo: !usuario.activo });
      fetchUsuarios();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/gestion/usuarios/${selectedUser._id}`);
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

  if (!can(user, 'usuarios', 'read')) {
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
              <TableRow key={u._id} sx={{ opacity: u.activo ? 1 : 0.5 }}>
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
            {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
            <TextField label="Nombre" fullWidth value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
            <TextField label="Email" type="email" fullWidth value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })} required />
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

            {/* PERMISOS */}
            <Accordion sx={{
              bgcolor: 'rgba(15,20,45,0.4)', borderRadius: '8px !important', overflow: 'hidden',
              border: '1px solid rgba(100,180,255,0.08)', '&:before': { display: 'none' },
            }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />}
                sx={{ minHeight: 40, '&.Mui-expanded': { minHeight: 40 }, '& .MuiAccordionSummary-content': { my: 1 } }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(150,200,255,0.8)' }}>
                  Permisos
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, pb: 1 }}>
                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(150,200,255,0.5)', mb: 1 }}>
                  Permisos base para <strong>{formData.rol}</strong>:
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {Object.entries(getDefaultPermissions(formData.rol)).map(([res, actions]) => (
                      <Chip key={res} label={`${res}: ${actions.join(', ')}`} size="small"
                        sx={{ fontSize: '0.6rem', bgcolor: 'rgba(100,180,255,0.08)', color: 'rgba(150,200,255,0.7)' }} />
                    ))}
                  </Box>
                </Typography>
                <FormControlLabel
                  control={<Checkbox size="small" checked={customPermisos} onChange={(e) => setCustomPermisos(e.target.checked)} />}
                  label={<Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>Personalizar permisos</Typography>}
                  sx={{ mb: 1 }}
                />
                {customPermisos && (
                  <Stack spacing={1}>
                    {Object.entries(RESOURCE_ACTIONS).map(([resource, actions]) => {
                      const currentPerms = permisosOverrides[resource] || [];
                      return (
                        <Box key={resource} sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1 }}>
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(150,200,255,0.7)', mb: 0.5, textTransform: 'capitalize' }}>
                            {resource}
                          </Typography>
                          <FormGroup row sx={{ gap: 0.3 }}>
                            {actions.map((action) => (
                              <FormControlLabel key={action}
                                control={
                                  <Checkbox size="small" checked={currentPerms.includes(action)}
                                    onChange={() => togglePermiso(resource, action)}
                                    sx={{ '& .MuiSvgIcon-root': { fontSize: 16 } }} />
                                }
                                label={<Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>{action}</Typography>}
                                sx={{ '& .MuiFormControlLabel-label': { ml: 0.3 }, mr: 0.5 }} />
                            ))}
                          </FormGroup>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </AccordionDetails>
            </Accordion>
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
