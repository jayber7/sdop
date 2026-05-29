import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Grid, Card, CardContent, Typography, Box, LinearProgress, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, Divider,
} from '@mui/material';
import {
  Engineering, Assignment, Business, TrendingUp, Warning,
  AccountBalance, Speed, CheckCircle, Cancel,
  OpenInNew, Visibility,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{
          p: 1, borderRadius: 2,
          bgcolor: color === 'primary' ? 'rgba(91,154,255,0.12)' :
                    color === 'success' ? 'rgba(0,219,180,0.12)' :
                    color === 'info' ? 'rgba(91,154,255,0.12)' :
                    'rgba(255,180,0,0.12)',
        }}>
          {React.cloneElement(icon, {
            sx: {
              fontSize: 32,
              color: color === 'primary' ? '#5b9aff' :
                     color === 'success' ? '#00dbb4' :
                     color === 'info' ? '#5b9aff' :
                     '#ffb300',
            },
          })}
        </Box>
        <Typography variant="h3" sx={{
          fontWeight: 700,
          color: color === 'primary' ? '#5b9aff' :
                 color === 'success' ? '#00dbb4' :
                 color === 'info' ? '#5b9aff' :
                 '#ffb300',
        }}>
          {typeof value === 'number' ? value.toLocaleString('es-BO') : value}
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{title}</Typography>
      {subtitle && <Typography variant="body2" sx={{ color: 'rgba(150,200,255,0.5)' }}>{subtitle}</Typography>}
      {trend && (
        <Chip label={trend} size="small"
          sx={{
            mt: 1,
            bgcolor: color === 'primary' ? 'rgba(91,154,255,0.12)' :
                     color === 'success' ? 'rgba(0,219,180,0.12)' :
                     color === 'info' ? 'rgba(91,154,255,0.12)' :
                     'rgba(255,180,0,0.12)',
            color: color === 'primary' ? '#5b9aff' :
                   color === 'success' ? '#00dbb4' :
                   color === 'info' ? '#5b9aff' :
                   '#ffb300',
            fontWeight: 600,
          }}
        />
      )}
    </CardContent>
  </Card>
);

const ProgressBar = ({ label, value, max, color = 'primary' }) => (
  <Box sx={{ mb: 1.5 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
      <Typography variant="caption" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{label}</Typography>
      <Typography variant="caption" sx={{ color: 'rgba(150,200,255,0.5)' }}>{value}</Typography>
    </Box>
    <LinearProgress
      variant="determinate"
      value={max > 0 ? (value / max) * 100 : 0}
      sx={{ height: 8, borderRadius: 1 }}
      color={color}
    />
  </Box>
);

const Dashboard = () => {
  const { selectedUnidad } = useOutletContext() || {};
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
        const params = { limit: 100 };
        if (selectedUnidad) params.unidadResponsable = selectedUnidad;
        const [proyectosRes, empresasRes, avancesStatsRes, avancesRes] = await Promise.all([
          api.get('/gestion/proyectos', { params }),
          api.get('/gestion/empresas'),
          api.get('/avances/stats'),
          api.get('/avances?limit=10'),
        ]);

        const proyectos = proyectosRes.data.data;
        setProyectos(proyectos.slice(0, 5));

        const presupuestoTotal = proyectos.reduce((s, p) => s + (p.presupuestoTotal || 0), 0);
        const avancePromedio = proyectos.length
          ? Math.round(proyectos.reduce((s, p) => s + (p.avanceFisico || 0), 0) / proyectos.length)
          : 0;

        const tipoCount = {};
        proyectos.forEach(p => { tipoCount[p.tipo] = (tipoCount[p.tipo] || 0) + 1; });
        setPorTipo(tipoCount);

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
  }, [selectedUnidad]);

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
      case 'PRE_INVERSION': return 'default';
      case 'SUSPENDIDO': return 'error';
      default: return 'default';
    }
  };

  const getVerificacionIcon = (foto) => {
    if (!foto?.verificacion) return null;
    switch (foto.verificacion.estado) {
      case 'VERIFICADO':
        return <CheckCircle fontSize="small" sx={{ color: '#00dbb4' }} />;
      case 'SOSPECHOSO':
        return <Warning fontSize="small" sx={{ color: '#ffb300' }} />;
      case 'RECHAZADO':
        return <Cancel fontSize="small" sx={{ color: '#ff6b6b' }} />;
      default:
        return null;
    }
  };

  if (loading) return <Box sx={{ p: 3 }}><LinearProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>Dashboard</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Proyectos" value={stats.proyectos} icon={<Engineering />} color="primary" subtitle={`${stats.enEjecucion} en ejecución`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Presupuesto Total" value={formatPresupuesto(stats.presupuestoTotal)} icon={<AccountBalance />} color="success" subtitle={`Avance promedio: ${stats.avancePromedio}%`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Reportes de Avance" value={stats.avances} icon={<Assignment />} color="info" subtitle={`${stats.avancesEnviados} pendientes`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Empresas" value={stats.empresas} icon={<Business />} color="secondary" subtitle={`${stats.avancesSospechosos} sospechosos`} trend={stats.avancesSospechosos > 0 ? 'Revisar' : 'Todo OK'} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'rgba(255,255,255,0.9)' }}>
                <Speed sx={{ mr: 1, verticalAlign: 'middle', color: 'rgba(150,220,255,0.7)' }} />
                Proyectos por Tipo
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {Object.entries(porTipo).map(([tipo, count]) => (
                <ProgressBar key={tipo} label={tipo} value={count} max={stats.proyectos} color={count >= 5 ? 'primary' : count >= 3 ? 'info' : 'warning'} />
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'rgba(255,255,255,0.9)' }}>
                <Assignment sx={{ mr: 1, verticalAlign: 'middle', color: 'rgba(150,220,255,0.7)' }} />
                Estado de Avances
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(0,219,180,0.1)', borderRadius: 2, border: '1px solid rgba(0,219,180,0.15)' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#00dbb4' }}>{stats.avancesAprobados}</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(0,219,180,0.7)' }}>Aprobados</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(91,154,255,0.1)', borderRadius: 2, border: '1px solid rgba(91,154,255,0.15)' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#5b9aff' }}>{stats.avancesEnviados}</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(91,154,255,0.7)' }}>Enviados</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,180,0,0.1)', borderRadius: 2, border: '1px solid rgba(255,180,0,0.15)' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffb300' }}>{stats.avancesObservados}</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,180,0,0.7)' }}>Observados</Typography>
                  </Box>
                </Grid>
              </Grid>
              {stats.avancesSospechosos > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,180,0,0.1)', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1, border: '1px solid rgba(255,180,0,0.15)' }}>
                  <Warning sx={{ color: '#ffb300' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'rgba(255,200,0,0.9)' }}>
                    {stats.avancesSospechosos} avance(s) con verificación sospechosa
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'rgba(255,255,255,0.9)' }}>
                <Engineering sx={{ mr: 1, verticalAlign: 'middle', color: 'rgba(150,220,255,0.7)' }} />
                Proyectos Recientes
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {proyectos.length === 0 ? (
                <Typography sx={{ color: 'rgba(255,255,255,0.4)' }}>No hay proyectos registrados</Typography>
              ) : (
                <Grid container spacing={2}>
                  {proyectos.map((p) => (
                    <Grid item xs={12} sm={6} key={p._id}>
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          bgcolor: 'rgba(10,14,39,0.4)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          '&:hover': { bgcolor: 'rgba(100,180,255,0.08)', borderColor: 'rgba(100,180,255,0.2)' },
                        }}
                        onClick={() => navigate(`/proyectos/${p._id}`)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }} noWrap>
                              {p.nombre}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                              {p.unidadResponsable && (
                                <Chip label={p.unidadResponsable.codigo} size="small"
                                  sx={{ bgcolor: `${p.unidadResponsable.color}22`, color: p.unidadResponsable.color, fontWeight: 700 }} />
                              )}
                              <Chip label={p.estado} size="small" color={getEstadoColor(p.estado)} />
                            </Box>
                          </Box>
                          <Typography variant="body2" sx={{ color: 'rgba(150,200,255,0.5)', mb: 1, fontSize: '0.8rem' }}>
                            {p.municipio || 'Sin municipio'} - {formatPresupuesto(p.presupuestoTotal)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" sx={{ color: 'rgba(150,200,255,0.6)', fontSize: '0.75rem' }}>
                              Físico: {p.avanceFisico}%
                            </Typography>
                            <LinearProgress variant="determinate" value={p.avanceFisico} sx={{ flexGrow: 1, height: 6, borderRadius: 1 }} />
                            <Typography variant="caption" sx={{ color: 'rgba(150,200,255,0.6)', fontSize: '0.75rem' }}>
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

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'rgba(255,255,255,0.9)' }}>
                <Assignment sx={{ mr: 1, verticalAlign: 'middle', color: 'rgba(150,220,255,0.7)' }} />
                Últimos Reportes de Avance
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {avancesRecientes.length === 0 ? (
                <Typography sx={{ color: 'rgba(255,255,255,0.4)' }}>No hay reportes de avance</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
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
                        const tieneSospechosa = avance.fotos?.some(f => f.verificacion?.estado === 'SOSPECHOSO');
                        return (
                          <TableRow key={avance._id} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}>
                                {avance.numeroReporte}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 200, fontSize: '0.85rem' }}>
                                {avance.proyectoId?.nombre || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={avance.estado} size="small"
                                color={avance.estado === 'APROBADO' ? 'success' : avance.estado === 'OBSERVADO' ? 'error' : 'info'} />
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#5b9aff' }}>
                                {avance.avanceFisicoAcumulado}%
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
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
                              <Typography variant="caption" sx={{ color: 'rgba(150,200,255,0.5)' }}>
                                {new Date(avance.fechaReporte).toLocaleDateString('es-BO')}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Ver detalle">
                                <IconButton size="small" onClick={() => navigate(`/avances/${avance._id}`)}
                                  sx={{ color: 'rgba(150,200,255,0.6)', '&:hover': { color: '#5b9aff' } }}>
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
