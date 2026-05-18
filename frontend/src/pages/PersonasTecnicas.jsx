import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from '@mui/material';
import { Add } from '@mui/icons-material';
import api from '../services/api';

const PersonasTecnicas = () => {
  const [personas, setPersonas] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ nombreCompleto: '', ci: '', profesion: '', rol: 'INSPECTOR', especialidad: 'GENERAL' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/gestion/personas-tecnicas').then((res) => { setPersonas(res.data.data); setLoading(false); });
  }, []);

  const handleSubmit = async () => {
    try {
      const res = await api.post('/gestion/personas-tecnicas', formData);
      setPersonas([...personas, res.data.data]);
      setOpen(false);
      setFormData({ nombreCompleto: '', ci: '', profesion: '', rol: 'INSPECTOR', especialidad: 'GENERAL' });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const rolColors = { SUPERVISOR: 'primary', INSPECTOR: 'secondary', FISCAL: 'info' };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Personas Técnicas</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Nueva Persona</Button>
      </Box>

      {loading ? <Typography>Cargando...</Typography> : personas.length === 0 ? (
        <Card><CardContent><Typography color="text.secondary">No hay personas técnicas registradas</Typography></CardContent></Card>
      ) : (
        <Grid container spacing={2}>
          {personas.map((p) => (
            <Grid item xs={12} sm={6} md={4} key={p._id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{p.nombreCompleto}</Typography>
                  <Typography variant="body2" color="text.secondary">CI: {p.ci}</Typography>
                  <Typography variant="body2" color="text.secondary">{p.profesion}</Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Chip label={p.rol} size="small" color={rolColors[p.rol]} />
                    <Chip label={p.especialidad} size="small" />
                  </Box>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    {p.experienciaAnios} años de experiencia | {p.proyectosAsignados?.length || 0} proyectos
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Persona Técnica</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nombre Completo" size="small" sx={{ mb: 2, mt: 1 }} value={formData.nombreCompleto}
            onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })} />
          <TextField fullWidth label="CI" size="small" sx={{ mb: 2 }} value={formData.ci}
            onChange={(e) => setFormData({ ...formData, ci: e.target.value })} />
          <TextField fullWidth label="Profesión" size="small" sx={{ mb: 2 }} value={formData.profesion}
            onChange={(e) => setFormData({ ...formData, profesion: e.target.value })} />
          <TextField select fullWidth label="Rol" size="small" sx={{ mb: 2 }} value={formData.rol}
            onChange={(e) => setFormData({ ...formData, rol: e.target.value })}>
            {['SUPERVISOR', 'INSPECTOR', 'FISCAL'].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>
          <TextField select fullWidth label="Especialidad" size="small" value={formData.especialidad}
            onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}>
            {['CAMINOS', 'PUENTES', 'ELECTRIFICACION', 'SANEAMIENTO', 'GENERAL'].map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PersonasTecnicas;
