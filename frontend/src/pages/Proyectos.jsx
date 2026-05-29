import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Grid, Chip, LinearProgress, Button, TextField, MenuItem, InputAdornment } from '@mui/material';
import { Search, Add, Visibility, Edit } from '@mui/icons-material';
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
  const { selectedUnidad } = useOutletContext() || {};
  const [proyectos, setProyectos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [filter, setFilter] = useState({ estado: '', tipo: '', unidadResponsable: '', search: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [proyectosRes, unidadesRes] = await Promise.all([
          api.get('/gestion/proyectos', { params: { limit: 100 } }),
          api.get('/unidades'),
        ]);
        setProyectos(proyectosRes.data.data);
        setUnidades(unidadesRes.data.data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const params = { limit: 100 };
        if (filter.estado) params.estado = filter.estado;
        if (filter.tipo) params.tipo = filter.tipo;
        if (filter.unidadResponsable) params.unidadResponsable = filter.unidadResponsable;
        else if (selectedUnidad) params.unidadResponsable = selectedUnidad;
        const res = await api.get('/gestion/proyectos', { params });
        setProyectos(res.data.data);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchProyectos();
  }, [filter.estado, filter.tipo, filter.unidadResponsable, selectedUnidad]);

  const filtered = proyectos.filter((p) =>
    !filter.search || p.nombre.toLowerCase().includes(filter.search.toLowerCase()) || p.codigoInterno?.toLowerCase().includes(filter.search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Proyectos</Typography>
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => navigate('/proyectos/nuevo')}>
          Nuevo Proyecto
        </Button>
      </Box>

      <Card sx={{ mb: 3, p: 0.5 }}>
        <CardContent sx={{ '&:last-child': { pb: 1 } }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth placeholder="Buscar proyecto..." size="small" value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField select fullWidth size="small" label="Estado" value={filter.estado}
                onChange={(e) => setFilter({ ...filter, estado: e.target.value })}>
                <MenuItem value="">Todos</MenuItem>
                {Object.keys(estadoColors).map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField select fullWidth size="small" label="Tipo" value={filter.tipo}
                onChange={(e) => setFilter({ ...filter, tipo: e.target.value })}>
                <MenuItem value="">Todos</MenuItem>
                {['CAMINO', 'PUENTE', 'ELECTRIFICACION', 'AGUA_POTABLE', 'SANEAMIENTO', 'EDIFICACION'].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField select fullWidth size="small" label="Unidad" value={filter.unidadResponsable}
                onChange={(e) => setFilter({ ...filter, unidadResponsable: e.target.value })}>
                <MenuItem value="">Todas</MenuItem>
                {unidades.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: u.color }} />
                      {u.nombre}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <LinearProgress />
      ) : filtered.length === 0 ? (
        <Card><CardContent><Typography sx={{ color: 'rgba(255,255,255,0.4)' }}>No se encontraron proyectos</Typography></CardContent></Card>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((p) => (
            <Grid item xs={12} key={p._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        {p.unidadResponsable && (
                          <Chip label={p.unidadResponsable.codigo} size="small"
                            sx={{ bgcolor: `${p.unidadResponsable.color}22`, color: p.unidadResponsable.color, fontWeight: 700 }} />
                        )}
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{p.nombre}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: 'rgba(150,200,255,0.5)' }}>{p.codigoInterno} | {p.tipo} | {p.municipio}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={p.estado} size="small" color={estadoColors[p.estado] || 'default'} />
                      <Button size="small" variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/proyectos/${p._id}/editar`)}>Editar</Button>
                      <Button size="small" variant="outlined" startIcon={<Visibility />} onClick={() => navigate(`/proyectos/${p._id}`)}>Ver</Button>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 3, mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Presupuesto: <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Bs {p.presupuestoTotal?.toLocaleString()}</strong></Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Fuente: {p.fuenteFinanciamiento}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(150,200,255,0.6)', minWidth: 60 }}>Físico: {p.avanceFisico}%</Typography>
                    <LinearProgress variant="determinate" value={p.avanceFisico} sx={{ flexGrow: 1, height: 8, borderRadius: 1 }} />
                    <Typography variant="caption" sx={{ color: 'rgba(150,200,255,0.6)', minWidth: 90 }}>Financiero: {p.avanceFinanciero}%</Typography>
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
