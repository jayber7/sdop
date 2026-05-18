import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import { Engineering, Assignment, Business, People, TrendingUp, Warning } from '@mui/icons-material';
import api from '../services/api';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}.lighter` }}>
          {React.cloneElement(icon, { sx: { color: `${color}.main`, fontSize: 32 } })}
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 700, color: `${color}.main` }}>{value}</Typography>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
      {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    proyectos: 0, enEjecucion: 0, empresas: 0, avances: 0,
  });
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [proyectosRes, empresasRes, avancesRes] = await Promise.all([
          api.get('/gestion/proyectos?limit=100'),
          api.get('/gestion/empresas'),
          api.get('/avances/stats'),
        ]);

        const proyectos = proyectosRes.data.data;
        setProyectos(proyectos.slice(0, 5));
        setStats({
          proyectos: proyectos.length,
          enEjecucion: proyectos.filter((p) => p.estado === 'EJECUCION').length,
          empresas: empresasRes.data.data.length,
          avances: avancesRes.data.data.total,
        });
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Box sx={{ p: 3 }}><LinearProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Dashboard</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Proyectos" value={stats.proyectos} icon={<Engineering />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="En Ejecución" value={stats.enEjecucion} icon={<TrendingUp />} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Empresas" value={stats.empresas} icon={<Business />} color="secondary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Reportes Avance" value={stats.avances} icon={<Assignment />} color="info" />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Proyectos Recientes</Typography>
      {proyectos.length === 0 ? (
        <Card><CardContent><Typography color="text.secondary">No hay proyectos registrados</Typography></CardContent></Card>
      ) : (
        <Grid container spacing={2}>
          {proyectos.map((p) => (
            <Grid item xs={12} key={p._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{p.nombre}</Typography>
                    <Typography variant="caption" sx={{
                      px: 1, py: 0.5, borderRadius: 1, bgcolor: p.estado === 'EJECUCION' ? 'success.light' : 'warning.light',
                      color: p.estado === 'EJECUCION' ? 'success.dark' : 'warning.dark',
                    }}>
                      {p.estado}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {p.municipio} - Bs {p.presupuestoTotal?.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="caption">Físico: {p.avanceFisico}%</Typography>
                    <LinearProgress variant="determinate" value={p.avanceFisico} sx={{ flexGrow: 1, height: 8, borderRadius: 1 }} />
                    <Typography variant="caption">Financiero: {p.avanceFinanciero}%</Typography>
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

export default Dashboard;
