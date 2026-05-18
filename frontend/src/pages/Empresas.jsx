import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import api from '../services/api';

const Empresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', nit: '', representanteLegal: '', especialidades: [], categoria: 'MEDIANA' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/gestion/empresas').then((res) => { setEmpresas(res.data.data); setLoading(false); });
  }, []);

  const handleSubmit = async () => {
    try {
      const res = await api.post('/gestion/empresas', formData);
      setEmpresas([...empresas, res.data.data]);
      setOpen(false);
      setFormData({ nombre: '', nit: '', representanteLegal: '', especialidades: [], categoria: 'MEDIANA' });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Empresas Constructoras</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Nueva Empresa</Button>
      </Box>

      {loading ? <Typography>Cargando...</Typography> : empresas.length === 0 ? (
        <Card><CardContent><Typography color="text.secondary">No hay empresas registradas</Typography></CardContent></Card>
      ) : (
        <Grid container spacing={2}>
          {empresas.map((e) => (
            <Grid item xs={12} sm={6} md={4} key={e._id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{e.nombre}</Typography>
                  <Typography variant="body2" color="text.secondary">NIT: {e.nit}</Typography>
                  <Typography variant="body2" color="text.secondary">{e.representanteLegal}</Typography>
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Empresa</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nombre" size="small" sx={{ mb: 2, mt: 1 }} value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
          <TextField fullWidth label="NIT" size="small" sx={{ mb: 2 }} value={formData.nit}
            onChange={(e) => setFormData({ ...formData, nit: e.target.value })} />
          <TextField fullWidth label="Representante Legal" size="small" sx={{ mb: 2 }} value={formData.representanteLegal}
            onChange={(e) => setFormData({ ...formData, representanteLegal: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Empresas;
