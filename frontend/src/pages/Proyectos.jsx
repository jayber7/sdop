import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, LinearProgress, Button, TextField, MenuItem, InputAdornment } from '@mui/material';
import { Search, Add, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const estadoColors = {
  PRE_INVERSION: 'default',
  DISEÑO: 'info',
  LICITACION: 'warning',
  EJECUCION: 'success',
  SUSPENDIDO: 'error',
  CONCLUIDO: 'secondary',
  ENTREGADO: 'success',
};

const Proyectos = () => {
  const [proyectos, setProyectos] = useState([]);
  const [filter, setFilter] = useState({ estado: '', tipo: '', search: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const params = { limit: 100 };
        if (filter.estado) params.estado = filter.estado;
        if (filter.tipo) params.tipo = filter.tipo;
        const res = await api.get('/gestion/proyectos', { params });
        setProyectos(res.data.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProyectos();
  }, [filter.estado, filter.tipo]);

  const filtered = proyectos.filter((p) =>
    !filter.search || p.nombre.toLowerCase().includes(filter.search.toLowerCase()) || p.codigoInterno?.toLowerCase().includes(filter.search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Proyectos</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/proyectos/nuevo')}>Nuevo Proyecto</Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth placeholder="Buscar proyecto..." size="small" value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField select fullWidth size="small" label="Estado" value={filter.estado}
            onChange={(e) => setFilter({ ...filter, estado: e.target.value })}>
            <MenuItem value="">Todos</MenuItem>
            {Object.keys(estadoColors).map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField select fullWidth size="small" label="Tipo" value={filter.tipo}
            onChange={(e) => setFilter({ ...filter, tipo: e.target.value })}>
            <MenuItem value="">Todos</MenuItem>
            {['CAMINO', 'PUENTE', 'ELECTRIFICACION', 'AGUA_POTABLE', 'SANEAMIENTO', 'EDIFICACION'].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>

      {loading ? <Typography>Cargando...</Typography> : filtered.length === 0 ? (
        <Card><CardContent><Typography color="text.secondary">No se encontraron proyectos</Typography></CardContent></Card>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((p) => (
            <Grid item xs={12} key={p._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{p.nombre}</Typography>
                      <Typography variant="body2" color="text.secondary">{p.codigoInterno} | {p.tipo} | {p.municipio}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={p.estado} size="small" color={estadoColors[p.estado] || 'default'} />
                      <Button size="small" startIcon={<Visibility />} onClick={() => navigate(`/proyectos/${p._id}`)}>Ver</Button>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 3, mb: 1 }}>
                    <Typography variant="body2">Presupuesto: <strong>Bs {p.presupuestoTotal?.toLocaleString()}</strong></Typography>
                    <Typography variant="body2">Fuente: {p.fuenteFinanciamiento}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="caption" sx={{ minWidth: 60 }}>Físico: {p.avanceFisico}%</Typography>
                    <LinearProgress variant="determinate" value={p.avanceFisico} sx={{ flexGrow: 1, height: 8, borderRadius: 1 }} />
                    <Typography variant="caption" sx={{ minWidth: 90 }}>Financiero: {p.avanceFinanciero}%</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Proyectos;
