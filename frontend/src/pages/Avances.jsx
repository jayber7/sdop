import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import { Add, Visibility, Delete, Edit, Warning, ExpandMore, Circle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ProjectSelectorModal from '../components/ProjectSelectorModal';

const stateColor = (estado) => {
  switch (estado) {
    case 'APROBADO': return 'success';
    case 'OBSERVADO': return 'error';
    case 'ENVIADO': return 'warning';
    default: return 'default';
  }
};

const Avances = () => {
  const [avances, setAvances] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState(new Set());
  const navigate = useNavigate();
  const { user } = useAuth();

  const canDelete = user?.rol === 'ADMIN';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [avRes, proyRes] = await Promise.all([
          api.get('/avances', { params: { limit: 100 } }),
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
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return avances;
    const q = search.trim().toLowerCase();
    return avances.filter((a) =>
      a.proyectoId?.nombre?.toLowerCase().includes(q) ||
      a.numeroReporte?.toLowerCase().includes(q)
    );
  }, [avances, search]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((a) => {
      const id = a.proyectoId?._id || 'sin-proyecto';
      if (!map[id]) map[id] = { proyecto: a.proyectoId, avances: [] };
      map[id].avances.push(a);
    });
    return Object.values(map).sort((a, b) => (b.avances.length - a.avances.length));
  }, [filtered]);

  const toggleExpanded = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/avances/${deleteTarget._id}`);
      setAvances((prev) => prev.filter((a) => a._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error al eliminar:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Avances de Obra</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setSelectorOpen(true)}>Nuevo Avance</Button>
      </Box>

      <TextField fullWidth size="small" placeholder="Buscar por nombre de proyecto o código de avance (AV-...)" value={search}
        onChange={(e) => setSearch(e.target.value)} sx={{ mb: 3 }} />

      {loading ? <Typography>Cargando...</Typography> : filtered.length === 0 ? (
        <Card><CardContent><Typography color="text.secondary">No hay avances registrados</Typography></CardContent></Card>
      ) : (
        grouped.map(({ proyecto, avances: items }) => {
          const proyId = proyecto?._id || 'sin-proyecto';
          const isExpanded = expanded.has(proyId);
          const estados = [...new Set(items.map((a) => a.estado))];
          return (
            <Accordion key={proyId} expanded={isExpanded} onChange={() => toggleExpanded(proyId)}
              sx={{
                mb: 1.5, borderRadius: '12px !important', overflow: 'hidden',
                bgcolor: 'rgba(15,20,45,0.6)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.06)',
                '&:before': { display: 'none' },
                '&.Mui-expanded': { my: 0, mb: 1.5 },
              }}>
              <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'rgba(255,255,255,0.6)' }} />}
                sx={{ minHeight: 48, '&.Mui-expanded': { minHeight: 48 }, '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', pr: 2 }}>
                  <Circle sx={{ fontSize: 10, color: 'rgba(100,180,255,0.5)' }} />
                  <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {proyecto?.nombre || 'Sin proyecto'}
                  </Typography>
                  <Chip label={`${items.length} avance${items.length !== 1 ? 's' : ''}`} size="small"
                    sx={{ bgcolor: 'rgba(100,180,255,0.12)', color: 'rgba(100,180,255,0.8)', fontSize: '0.7rem' }} />
                  {estados.map((e) => (
                    <Chip key={e} label={e} size="small" color={stateColor(e)}
                      sx={{ fontSize: '0.65rem', height: 20 }} />
                  ))}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, pb: 1.5, px: 2 }}>
                <Grid container spacing={1.5}>
                  {items.map((a) => (
                    <Grid item xs={12} key={a._id}>
                      <Card sx={{
                        bgcolor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 2,
                        '&:hover': { borderColor: 'rgba(100,180,255,0.2)' },
                      }}>
                        <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                {a.numeroReporte}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {a.actividadesRealizadas?.substring(0, 80) || a.hitoDescripcion?.substring(0, 80) || '—'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', flexShrink: 0 }}>
                              <Chip label={a.estado} size="small" color={stateColor(a.estado)}
                                sx={{ fontSize: '0.65rem', height: 20 }} />
                              <Box sx={{ display: 'flex', gap: 0.3 }}>
                                <Button size="small" sx={{ minWidth: 32, px: 0.8 }} onClick={() => navigate(`/avances/${a._id}`)}>
                                  <Visibility fontSize="small" />
                                </Button>
                                {(a.estado === 'ENVIADO' || user?.rol === 'ADMIN') && (
                                  <Button size="small" sx={{ minWidth: 32, px: 0.8 }} onClick={() => navigate(`/avances/${a._id}/editar`)}>
                                    <Edit fontSize="small" />
                                  </Button>
                                )}
                                {canDelete && (
                                  <Button size="small" color="error" sx={{ minWidth: 32, px: 0.8 }}
                                    onClick={() => setDeleteTarget(a)}>
                                    <Delete fontSize="small" />
                                  </Button>
                                )}
                              </Box>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Físico: {a.avanceFisicoAcumulado}% | Financiero: {a.avanceFinancieroAcumulado}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              📷 {a.fotos?.length || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(a.fechaReporte).toLocaleDateString('es-BO')}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          );
        })
      )}

      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="sm" fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(10,14,39,0.96)', backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,80,80,0.2)', borderRadius: 3,
            boxShadow: '0 8px 60px rgba(0,0,0,0.7)',
          },
        }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'rgba(255,80,80,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Warning sx={{ fontSize: 18, color: '#ff5252' }} />
          </Box>
          <Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: '0.95rem' }}>
              Eliminar Avance
            </Typography>
            <Typography sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.65rem' }}>
              Esta acción no se puede deshacer
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ bgcolor: 'rgba(255,80,80,0.08)', color: 'rgba(255,150,150,0.9)', border: '1px solid rgba(255,80,80,0.15)', '& .MuiAlert-icon': { color: '#ff5252' } }}>
            Se eliminará el avance <strong>{deleteTarget?.numeroReporte}</strong> y todas sus fotos asociadas.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}
            sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'rgba(255,255,255,0.8)' } }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleDelete} disabled={deleting}
            sx={{ bgcolor: 'rgba(255,80,80,0.25)', color: 'rgba(255,150,150,0.95)', border: '1px solid rgba(255,80,80,0.3)', '&:hover': { bgcolor: 'rgba(255,80,80,0.4)' } }}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      <ProjectSelectorModal open={selectorOpen} onClose={() => setSelectorOpen(false)} />
    </Box>
  );
};

export default Avances;
