import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, Button, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add } from '@mui/icons-material';
import api from '../services/api';

const HitosPresupuestarios = () => {
  const [hitos, setHitos] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [filter, setFilter] = useState({ proyectoId: '' });
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ proyectoId: '', numero: 1, descripcion: '', avanceFisicoMinimo: 0, montoAsociado: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hitosRes, proyRes] = await Promise.all([
          api.get('/gestion/hitos', { params: filter }),
          api.get('/gestion/proyectos', { params: { limit: 100 } }),
        ]);
        setHitos(hitosRes.data.data);
        setProyectos(proyRes.data.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filter]);

  const handleSubmit = async () => {
    try {
      const res = await api.post('/gestion/hitos', formData);
      setHitos([...hitos, res.data.data]);
      setOpen(false);
      setFormData({ proyectoId: '', numero: 1, descripcion: '', avanceFisicoMinimo: 0, montoAsociado: 0 });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const estadoColors = { PENDIENTE: 'warning', CUMPLIDO: 'success', PAGADO: 'primary', RECHAZADO: 'error' };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Hitos Presupuestarios</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Nuevo Hito</Button>
      </Box>

      <TextField select fullWidth size="small" label="Proyecto" value={filter.proyectoId} sx={{ mb: 3 }}
        onChange={(e) => setFilter({ proyectoId: e.target.value })}>
        <MenuItem value="">Todos</MenuItem>
        {proyectos.map((p) => <MenuItem key={p._id} value={p._id}>{p.nombre}</MenuItem>)}
      </TextField>

      {loading ? <Typography>Cargando...</Typography> : hitos.length === 0 ? (
        <Card><CardContent><Typography color="text.secondary">No hay hitos registrados</Typography></CardContent></Card>
      ) : (
        <Grid container spacing={2}>
          {hitos.map((h) => (
            <Grid item xs={12} key={h._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Hito #{h.numero}: {h.descripcion}</Typography>
                    <Chip label={h.estado} size="small" color={estadoColors[h.estado]} />
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Avance mínimo</Typography><Typography variant="body2">{h.avanceFisicoMinimo}%</Typography></Grid>
                    <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Monto</Typography><Typography variant="body2">Bs {h.montoAsociado?.toLocaleString()}</Typography></Grid>
                    <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Cumplimiento</Typography><Typography variant="body2">{h.fechaCumplimiento ? new Date(h.fechaCumplimiento).toLocaleDateString('es-BO') : '-'}</Typography></Grid>
                    <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Pago</Typography><Typography variant="body2">{h.fechaPago ? new Date(h.fechaPago).toLocaleDateString('es-BO') : '-'}</Typography></Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Hito Presupuestario</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Proyecto" size="small" sx={{ mb: 2, mt: 1 }} value={formData.proyectoId}
            onChange={(e) => setFormData({ ...formData, proyectoId: e.target.value })}>
            {proyectos.map((p) => <MenuItem key={p._id} value={p._id}>{p.nombre}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Descripción" size="small" sx={{ mb: 2 }} value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} />
          <TextField fullWidth label="Avance Físico Mínimo (%)" type="number" size="small" sx={{ mb: 2 }} value={formData.avanceFisicoMinimo}
            onChange={(e) => setFormData({ ...formData, avanceFisicoMinimo: e.target.value })} />
          <TextField fullWidth label="Monto Asociado (Bs)" type="number" size="small" value={formData.montoAsociado}
            onChange={(e) => setFormData({ ...formData, montoAsociado: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HitosPresupuestarios;
