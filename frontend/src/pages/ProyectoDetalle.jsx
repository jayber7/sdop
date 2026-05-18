import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Chip, LinearProgress, Button, Divider, Tabs, Tab,
} from '@mui/material';
import { ArrowBack, Map as MapIcon, Assignment } from '@mui/icons-material';
import api from '../services/api';

const ProyectoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState(null);
  const [avances, setAvances] = useState([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [proyRes, avRes] = await Promise.all([
          api.get(`/gestion/proyectos/${id}`),
          api.get(`/avances?proyectoId=${id}`),
        ]);
        setProyecto(proyRes.data.data);
        setAvances(avRes.data.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading || !proyecto) return <Box sx={{ p: 3 }}>Cargando...</Box>;

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/proyectos')} sx={{ mb: 2 }}>Volver</Button>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>{proyecto.nombre}</Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Código</Typography><Typography variant="body2">{proyecto.codigoInterno}</Typography></Grid>
                <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Tipo</Typography><Typography variant="body2">{proyecto.tipo}</Typography></Grid>
                <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Estado</Typography><Chip label={proyecto.estado} size="small" color={proyecto.estado === 'EJECUCION' ? 'success' : 'default'} /></Grid>
                <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Presupuesto</Typography><Typography variant="body2">Bs {proyecto.presupuestoTotal?.toLocaleString()}</Typography></Grid>
                <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Municipio</Typography><Typography variant="body2">{proyecto.municipio}</Typography></Grid>
                <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Provincia</Typography><Typography variant="body2">{proyecto.provincia}</Typography></Grid>
                <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Contrato</Typography><Typography variant="body2">{proyecto.numeroContrato || '-'}</Typography></Grid>
                <Grid item xs={6} sm={3}><Typography variant="caption" color="text.secondary">Plazo</Typography><Typography variant="body2">{proyecto.plazoDias} días</Typography></Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Avance Físico: {proyecto.avanceFisico}%</Typography>
                <LinearProgress variant="determinate" value={proyecto.avanceFisico} sx={{ height: 10, borderRadius: 2 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Avance Financiero: {proyecto.avanceFinanciero}%</Typography>
                <LinearProgress variant="determinate" value={proyecto.avanceFinanciero} sx={{ height: 10, borderRadius: 2, bgcolor: 'secondary.light' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Actores</Typography>
              <Typography variant="body2"><strong>Empresa:</strong> {proyecto.empresaId?.nombre || '-'}</Typography>
              <Typography variant="body2"><strong>Supervisor:</strong> {proyecto.supervisorId?.nombreCompleto || '-'}</Typography>
              <Typography variant="body2"><strong>Inspector:</strong> {proyecto.inspectorId?.nombreCompleto || '-'}</Typography>
              {proyecto.coordenadas?.lat && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 2, textAlign: 'center' }}>
                  <MapIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                  <Typography variant="body2">{proyecto.coordenadas.lat.toFixed(6)}, {proyecto.coordenadas.lng.toFixed(6)}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label={`Avances (${avances.length})`} icon={<Assignment />} iconPosition="start" />
        </Tabs>
        <Button variant="contained" onClick={() => navigate(`/avances/${id}/nuevo`)}>Registrar Avance</Button>
      </Box>

      {avances.length === 0 ? (
        <Card><CardContent><Typography color="text.secondary">No hay avances registrados</Typography></CardContent></Card>
      ) : (
        <Grid container spacing={2}>
          {avances.map((a) => (
            <Grid item xs={12} key={a._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{a.numeroReporte}</Typography>
                    <Chip label={a.estado} size="small" color={a.estado === 'APROBADO' ? 'success' : a.estado === 'OBSERVADO' ? 'error' : 'warning'} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">{a.hitoDescripcion}</Typography>
                  <Typography variant="caption">{new Date(a.fechaReporte).toLocaleDateString('es-BO')}</Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Typography variant="caption">Físico: {a.avanceFisicoAcumulado}%</Typography>
                    <Typography variant="caption">Financiero: {a.avanceFinancieroAcumulado}%</Typography>
                    <Typography variant="caption">Fotos: {a.fotos?.length || 0}</Typography>
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

export default ProyectoDetalle;
