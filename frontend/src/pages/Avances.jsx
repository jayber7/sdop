import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, Button, TextField, MenuItem } from '@mui/material';
import { Add, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProjectSelectorModal from '../components/ProjectSelectorModal';

const Avances = () => {
  const [avances, setAvances] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [filter, setFilter] = useState({ proyectoId: '', estado: '' });
  const [loading, setLoading] = useState(true);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [avRes, proyRes] = await Promise.all([
          api.get('/avances', { params: { limit: 100, ...filter } }),
          api.get('/gestion/proyectos', { params: { limit: 100 } }),
        ]);
        setAvances(avRes.data.data);
        setProyectos(proyRes.data.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filter]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Avances de Obra</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setSelectorOpen(true)}>Nuevo Avance</Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField select fullWidth size="small" label="Proyecto" value={filter.proyectoId}
            onChange={(e) => setFilter({ ...filter, proyectoId: e.target.value })}>
            <MenuItem value="">Todos</MenuItem>
            {proyectos.map((p) => <MenuItem key={p._id} value={p._id}>{p.nombre}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField select fullWidth size="small" label="Estado" value={filter.estado}
            onChange={(e) => setFilter({ ...filter, estado: e.target.value })}>
            <MenuItem value="">Todos</MenuItem>
            {['BORRADOR', 'ENVIADO', 'APROBADO', 'OBSERVADO'].map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>

      {loading ? <Typography>Cargando...</Typography> : avances.length === 0 ? (
        <Card><CardContent><Typography color="text.secondary">No hay avances registrados</Typography></CardContent></Card>
      ) : (
        <Grid container spacing={2}>
          {avances.map((a) => (
            <Grid item xs={12} key={a._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{a.numeroReporte}</Typography>
                      <Typography variant="body2" color="text.secondary">{a.proyectoId?.nombre || 'Proyecto'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip label={a.estado} size="small" color={a.estado === 'APROBADO' ? 'success' : a.estado === 'OBSERVADO' ? 'error' : 'warning'} />
                      <Button size="small" startIcon={<Visibility />} onClick={() => navigate(`/avances/${a._id}`)}>Ver</Button>
                    </Box>
                  </Box>
                  <Typography variant="body2">{a.hitoDescripcion}</Typography>
                  <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                    <Typography variant="caption">Físico: {a.avanceFisicoAcumulado}%</Typography>
                    <Typography variant="caption">Financiero: {a.avanceFinancieroAcumulado}%</Typography>
                    <Typography variant="caption">Fotos: {a.fotos?.length || 0}</Typography>
                    <Typography variant="caption">{new Date(a.fechaReporte).toLocaleDateString('es-BO')}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <ProjectSelectorModal open={selectorOpen} onClose={() => setSelectorOpen(false)} />
    </Box>
  );
};

export default Avances;
