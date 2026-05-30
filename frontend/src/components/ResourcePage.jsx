import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip,
  LinearProgress, IconButton, Tooltip, Alert, Stack, CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import api from '../services/api';
import { useOutletContext } from 'react-router-dom';

const ResourcePage = ({ config, title }) => {
  const { selectedUnidad } = useOutletContext() || {};
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({});
  const [filters, setFilters] = useState({});

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedUnidad) params.unidadResponsable = selectedUnidad;
      if (filters.estado) params.estado = filters.estado;
      if (filters.municipio) params.municipio = filters.municipio;
      const res = await api.get(config.endpoint, { params });
      setItems(res.data.data || []);
    } catch (err) {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [selectedUnidad]);

  const handleOpenDialog = (item = null) => {
    if (item) {
      setSelectedItem(item);
      const data = {};
      config.formFields.forEach((field) => {
        const val = item[field.name];
        data[field.name] = val !== undefined && val !== null ? val : '';
      });
      if (item.fechaProgramada) data.fechaProgramada = new Date(item.fechaProgramada).toISOString().split('T')[0];
      if (item.fechaInicio) data.fechaInicio = new Date(item.fechaInicio).toISOString().split('T')[0];
      if (item.fechaFin) data.fechaFin = new Date(item.fechaFin).toISOString().split('T')[0];
      if (item.fechaElaboracion) data.fechaElaboracion = new Date(item.fechaElaboracion).toISOString().split('T')[0];
      if (item.fechaAprobacion) data.fechaAprobacion = new Date(item.fechaAprobacion).toISOString().split('T')[0];
      if (item.fechaEvaluacion) data.fechaEvaluacion = new Date(item.fechaEvaluacion).toISOString().split('T')[0];
      if (item.fechaRealizada) data.fechaRealizada = new Date(item.fechaRealizada).toISOString().split('T')[0];
      if (item.fechaSolicitud) data.fechaSolicitud = new Date(item.fechaSolicitud).toISOString().split('T')[0];
      if (item.fechaRespuesta) data.fechaRespuesta = new Date(item.fechaRespuesta).toISOString().split('T')[0];
      if (item.fechaCumplimiento) data.fechaCumplimiento = new Date(item.fechaCumplimiento).toISOString().split('T')[0];
      if (item.fechaRealizada) data.fechaRealizada = new Date(item.fechaRealizada).toISOString().split('T')[0];
      setFormData(data);
    } else {
      setSelectedItem(null);
      const data = {};
      config.formFields.forEach((field) => { data[field.name] = field.type === 'number' ? 0 : ''; });
      setFormData(data);
    }
    setDialogOpen(true);
    setError('');
  };

  const handleCloseDialog = () => { setDialogOpen(false); setSelectedItem(null); };

  const handleSubmit = async () => {
    setError('');
    try {
      const submitData = { ...formData };
      if (selectedUnidad) submitData.unidadResponsable = selectedUnidad;
      if (selectedItem) {
        await api.put(`${config.endpoint}/${selectedItem._id}`, submitData);
        setSuccess('Registro actualizado');
      } else {
        await api.post(config.endpoint, submitData);
        setSuccess('Registro creado');
      }
      handleCloseDialog();
      fetchItems();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`${config.endpoint}/${selectedItem._id}`);
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchItems();
      setSuccess('Registro eliminado');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const renderCell = (item, column) => {
    const val = item[column.field];
    if (val === undefined || val === null) return '-';
    switch (column.type) {
      case 'chip':
        return <Chip label={val} size="small" />;
      case 'money':
        return `Bs. ${Number(val).toLocaleString('es-BO')}`;
      case 'progress':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 100 }}>
            <LinearProgress variant="determinate" value={Math.min(Number(val) || 0, 100)} sx={{ flexGrow: 1, height: 8, borderRadius: 1 }} />
            <Typography variant="caption">{val}%</Typography>
          </Box>
        );
      case 'date':
        return val ? new Date(val).toLocaleDateString('es-BO') : '-';
      default:
        return val;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>{title}</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Nuevo Registro</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">No hay registros</Typography></Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {config.columns.map((col) => (
                  <TableCell key={col.field} sx={{ fontWeight: 700 }}>{col.header}</TableCell>
                ))}
                <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item._id} hover>
                  {config.columns.map((col) => (
                    <TableCell key={col.field}>{renderCell(item, col)}</TableCell>
                  ))}
                  <TableCell align="right">
                    <Tooltip title="Editar"><IconButton size="small" onClick={() => handleOpenDialog(item)}><Edit fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={() => { setSelectedItem(item); setDeleteDialogOpen(true); }}><Delete fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedItem ? 'Editar Registro' : 'Nuevo Registro'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {config.formFields.map((field) => (
              <TextField
                key={field.name}
                fullWidth
                size="small"
                label={field.label}
                type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'textarea' ? 'text' : 'text'}
                value={formData[field.name] || ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                required={field.required}
                multiline={field.type === 'textarea'}
                rows={field.type === 'textarea' ? 3 : undefined}
                InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                select={field.type === 'select'}
              >
                {field.type === 'select' && (
                  <>
                    <MenuItem value="">Seleccionar...</MenuItem>
                    {field.options?.map((opt) => (
                      <MenuItem key={opt} value={opt}>{typeof opt === 'string' ? opt.replace(/_/g, ' ') : opt}</MenuItem>
                    ))}
                  </>
                )}
              </TextField>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!config.formFields.filter(f => f.required).every(f => formData[f.name])}>
            {selectedItem ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent><Typography>¿Está seguro de eliminar este registro?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResourcePage;
