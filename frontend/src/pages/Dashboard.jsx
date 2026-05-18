import React, { useEffect, useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, LinearProgress, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Divider,
} from '@mui/material';
import {
  Engineering, Assignment, Business, People, TrendingUp, Warning,
  AccountBalance, Speed, CheckCircle, Cancel, Refresh,
  OpenInNew, Visibility,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}.lighter` }}>
          {React.cloneElement(icon, { sx: { color: `${color}.main`, fontSize: 32 } })}
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 700, color: `${color}.main` }}>
          {typeof value === 'number' ? value.toLocaleString('es-BO') : value}
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
      {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
      {trend && (
        <Chip
          label={trend}
          size="small"
          sx={{ mt: 1, bgcolor: `${color}.lighter`, color: `${color}.main`, fontWeight: 600 }}
        />
      )}
    </CardContent>
  </Card>
);

const ProgressBar = ({ label, value, max, color = 'primary' }) => (
  <Box sx={{ mb: 1.5 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>{label}</Typography>
      <Typography variant="caption" color="text.secondary">{value}</Typography>
    </Box>
    <LinearProgress
      variant="determinate"
      value={max > 0 ? (value / max) * 100 : 0}
      sx={{ height: 8, borderRadius: 1, bgcolor: `${color}.lighter` }}
      color={color}
    />
  </Box>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    proyectos: 0, enEjecucion: 0, empresas: 0, avances: 0,
    presupuestoTotal: 0, avancePromedio: 0,
    avancesAprobados: 0, avancesEnviados: 0, avancesObservados: 0,
    avancesSospechosos: 0,
  });
  const [proyectos, setProyectos] = useState([]);
  const [avancesRecientes, setAvancesRecientes] = useState([]);
  const [porTipo, setPorTipo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [proyectosRes, empresasRes, avancesStatsRes, avancesRes] = await Promise.all([
          api.get('/gestion/proyectos?limit=100'),
          api.get('/gestion/empresas'),
          api.get('/avances/stats'),
          api.get('/avances?limit=10'),
        ]);

        const proyectos = proyectosRes.data.data;
        setProyectos(proyectos.slice(0, 5));

        // Calcular stats
        const presupuestoTotal = proyectos.reduce((s, p) => s + (p.presupuestoTotal || 0), 0);
        const avancePromedio = proyectos.length
          ? Math.round(proyectos.reduce((s, p) => s + (p.avanceFisico || 0), 0) / proyectos.length)
          : 0;

        // Proyectos por tipo
        const tipoCount = {};
        proyectos.forEach(p => { tipoCount[p.tipo] = (tipoCount[p.tipo] || 0) + 1; });
        setPorTipo(tipoCount);

        // Avances sospechosos
        const avancesData = avancesRes.data.data || [];
        const sospechosos = avancesData.filter(a =>
          a.fotos?.some(f => f.verificacion?.estado === 'SOSPECHOSO')
        ).length;

        setAvancesRecientes(avancesData.slice(0, 5));

        setStats({
          proyectos: proyectos.length,
          enEjecucion: proyectos.filter(p => p.estado === 'EJECUCION').length,
          empresas: empresasRes.data.data?.length || 0,
          avances: avancesStatsRes.data.data?.total || 0,
          presupuestoTotal,
          avancePromedio,
          avancesAprobados: avancesStatsRes.data.data?.aprobados || 0,
          avancesEnviados: avancesStatsRes.data.data?.enviados || 0,
          avancesObservados: avancesStatsRes.data.data?.observados || 0,
          avancesSospechosos: sospechosos,
        });
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatPresupuesto = (val) => {
    if (val >= 1000000) return `Bs ${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `Bs ${(val / 1000).toFixed(0)}K`;
    return `Bs ${val}`;
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'EJECUCION': return 'success';
      case 'DISEÑO': return 'info';
      case 'LICITACION': return 'warning';
      case 'CONCLUIDO': return 'primary';
      case 'ENTREGADO': return 'default';
      case 'PRE_INVERSION': return 'grey';
      case 'SUSPENDIDO': return 'error';
      default: return 'default';
    }
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      CAMINO: '🛣️ Camino',
      PUENTE: '🌉 Puente',
      ELECTRIFICACION: '⚡ Electrificación',
      AGUA_POTABLE: '💧 Agua Potable',
      SANEAMIENTO: '🚿 Saneamiento',
      EDIFICACION: '🏗️ Edificación',
      OTRO: '📋 Otro',
    };
    return labels[tipo] || tipo;
  };

  const getVerificacionIcon = (foto) => {
    if (!foto?.verificacion) return null;
    switch (foto.verificacion.estado) {
      case 'VERIFICADO':
        return <CheckCircle fontSize="small" color="success" />;
      case 'SOSPECHOSO':
        return <Warning fontSize="small" color="warning" />;
      case 'RECHAZADO':
        return <Cancel fontSize="small" color="error" />;
      default:
        return null;
    }
  };

  if (loading) return <Box sx={{ p: 3 }}><LinearProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Dashboard</Typography>
        <Tooltip title="Actualizar">
          <IconButton onClick={() => window.location.reload()}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Proyectos"
            value={stats.proyectos}
            icon={<Engineering />}
            color="primary"
            subtitle={`${stats.enEjecucion} en ejecución`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Presupuesto Total"
            value={formatPresupuesto(stats.presupuestoTotal)}
            icon={<AccountBalance />}
            color="success"
            subtitle={`Avance promedio: ${stats.avancePromedio}%`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Reportes de Avance"
            value={stats.avances}
            icon={<Assignment />}
            color="info"
            subtitle={`${stats.avancesEnviados} pendientes`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Empresas"
            value={stats.empresas}
            icon={<Business />}
            color="secondary"
            subtitle={`${stats.avancesSospechosos} avances sospechosos`}
            trend={stats.avancesSospechosos > 0 ? '⚠️ Revisar' : '✅ Todo OK'}
          />
        </Grid>
      </Grid>

      {/* Distribución y avances recientes */}
      <Grid container spacing={3}>
        {/* Proyectos por tipo */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                <Speed sx={{ mr: 1, verticalAlign: 'middle' }} />
                Proyectos por Tipo
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {Object.entries(porTipo).map(([tipo, count]) => (
                <ProgressBar
                  key={tipo}
                  label={getTipoLabel(tipo)}
                  value={count}
                  max={stats.proyectos}
                  color={count >= 5 ? 'primary' : count >= 3 ? 'info' : 'warning'}
                />
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Resumen de avances */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                Estado de Avances
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.lighter', borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {stats.avancesAprobados}
                    </Typography>
                    <Typography variant="caption" color="success.main">Aprobados</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.lighter', borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                      {stats.avancesEnviados}
                    </Typography>
                    <Typography variant="caption" color="info.main">Enviados</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.lighter', borderRadius: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                      {stats.avancesObservados}
                    </Typography>
                    <Typography variant="caption" color="warning.main">Observados</Typography>
                  </Box>
                </Grid>
              </Grid>
              {stats.avancesSospechosos > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.lighter', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warning color="warning" />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.dark' }}>
                    {stats.avancesSospechosos} avance(s) con verificación sospechosa
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Proyectos recientes */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                <Engineering sx={{ mr: 1, verticalAlign: 'middle' }} />
                Proyectos Recientes
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {proyectos.length === 0 ? (
                <Typography color="text.secondary">No hay proyectos registrados</Typography>
              ) : (
                <Grid container spacing={2}>
                  {proyectos.map((p) => (
                    <Grid item xs={12} sm={6} key={p._id}>
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
                        }}
                        onClick={() => navigate(`/proyectos/${p._id}`)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9rem' }} noWrap>
                              {p.nombre}
                            </Typography>
                            <Chip
                              label={p.estado}
                              size="small"
                              color={getEstadoColor(p.estado)}
                              sx={{ ml: 1, flexShrink: 0 }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
                            {p.municipio || 'Sin municipio'} - {formatPresupuesto(p.presupuestoTotal)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                              Físico: {p.avanceFisico}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={p.avanceFisico}
                              sx={{
                                flexGrow: 1,
                                height: 6,
                                borderRadius: 1,
                                bgcolor: 'action.hover',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: p.avanceFisico >= 50 ? 'success.main' : p.avanceFisico >= 25 ? 'warning.main' : 'error.main',
                                },
                              }}
                            />
                            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                              Fin: {p.avanceFinanciero}%
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Avances recientes con verificación */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                Últimos Reportes de Avance
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {avancesRecientes.length === 0 ? (
                <Typography color="text.secondary">No hay reportes de avance</Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell><strong>Reporte</strong></TableCell>
                        <TableCell><strong>Proyecto</strong></TableCell>
                        <TableCell align="center"><strong>Estado</strong></TableCell>
                        <TableCell align="center"><strong>Físico</strong></TableCell>
                        <TableCell align="center"><strong>Fotos</strong></TableCell>
                        <TableCell align="center"><strong>Verificación</strong></TableCell>
                        <TableCell align="right"><strong>Fecha</strong></TableCell>
                        <TableCell align="center"><strong>Acciones</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {avancesRecientes.map((avance) => {
                        const fotoVerificada = avance.fotos?.[0]?.verificacion;
                        const tieneSospechosa = avance.fotos?.some(f => f.verificacion?.estado === 'SOSPECHOSO');
                        return (
                          <TableRow key={avance._id} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                {avance.numeroReporte}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 200, fontSize: '0.85rem' }}>
                                {avance.proyectoId?.nombre || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={avance.estado}
                                size="small"
                                color={avance.estado === 'APROBADO' ? 'success' : avance.estado === 'OBSERVADO' ? 'error' : 'info'}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {avance.avanceFisicoAcumulado}%
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2">
                                {avance.fotos?.length || 0}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                {avance.fotos?.map((foto, i) => (
                                  <Tooltip key={i} title={foto.verificacion?.observaciones || ''}>
                                    {getVerificacionIcon(foto)}
                                  </Tooltip>
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="caption">
                                {new Date(avance.fechaReporte).toLocaleDateString('es-BO')}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Ver detalle">
                                <IconButton size="small" onClick={() => navigate(`/avances/${avance._id}`)}>
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
