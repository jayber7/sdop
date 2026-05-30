import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
} from '@mui/material';
import { Add, Visibility, Delete, Warning } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ProjectSelectorModal from '../components/ProjectSelectorModal';

const Avances = () => {
  const [avances, setAvances] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [filter, setFilter] = useState({ proyectoId: '', estado: '' });
  const [loading, setLoading] = useState(true);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const canDelete = user?.rol === 'ADMIN';

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

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField select fullWidth label="Filtrar por Proyecto" value={filter.proyectoId}
            onChange={(e) => setFilter({ ...filter, proyectoId: e.target.value })}>
            <MenuItem value="">Todos los proyectos</MenuItem>
            {proyectos.map((p) => <MenuItem key={p._id} value={p._id}>{p.nombre}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField select fullWidth label="Filtrar por Estado" value={filter.estado}
            onChange={(e) => setFilter({ ...filter, estado: e.target.value })}>
            <MenuItem value="">Todos los estados</MenuItem>
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
                      {canDelete && (
                        <Button size="small" color="error" startIcon={<Delete />}
                          onClick={() => setDeleteTarget(a)}>Eliminar</Button>
                      )}
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
