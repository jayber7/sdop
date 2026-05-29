import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog, DialogTitle, DialogContent, TextField, List, ListItemButton,
  ListItemText, Typography, Box, InputAdornment, CircularProgress,
} from '@mui/material';
import { Search, LocationOn } from '@mui/icons-material';
import api from '../services/api';

export default function ProjectSelectorModal({ open, onClose }) {
  const [proyectos, setProyectos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setLoading(true);
      api
        .get('/gestion/proyectos', { params: { limit: 200 } })
        .then((res) => setProyectos(res.data.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
      setSearch('');
    }
  }, [open]);

  const filtered = search
    ? proyectos.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
          p.codigoInterno?.toLowerCase().includes(search.toLowerCase()) ||
          p.municipio?.toLowerCase().includes(search.toLowerCase())
      )
    : proyectos;

  const handleSelect = (id) => {
    onClose();
    navigate(`/avances/${id}/nuevo`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'rgba(10,14,39,0.95)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(100,180,255,0.12)',
          borderRadius: 3,
          boxShadow: '0 8px 60px rgba(0,0,0,0.7)',
          backgroundImage: 'linear-gradient(135deg, rgba(10,14,39,0.95) 0%, rgba(26,16,64,0.95) 100%)',
        },
      }}
    >
      <DialogTitle sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, pb: 1 }}>
        Seleccionar Proyecto
      </DialogTitle>
      <DialogContent sx={{ pb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar proyecto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'rgba(150,200,255,0.5)', fontSize: 20 }} />
              </InputAdornment>
            ),
            sx: {
              color: 'rgba(255,255,255,0.8)',
              bgcolor: 'rgba(255,255,255,0.05)',
              borderRadius: 2,
              '& fieldset': { border: '1px solid rgba(255,255,255,0.1)' },
              '&:hover fieldset': { borderColor: 'rgba(100,180,255,0.3) !important' },
              '&.Mui-focused fieldset': { borderColor: 'rgba(100,180,255,0.5) !important' },
            },
          }}
          sx={{ mb: 2, mt: 1 }}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} sx={{ color: 'rgba(100,200,255,0.6)' }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Typography sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', py: 4, fontSize: '0.85rem' }}>
            {search ? 'Sin resultados' : 'No hay proyectos disponibles'}
          </Typography>
        ) : (
          <List sx={{ maxHeight: 360, overflow: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2 } }}>
            {filtered.map((p) => (
              <ListItemButton
                key={p._id}
                onClick={() => handleSelect(p._id)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  bgcolor: 'rgba(255,255,255,0.03)',
                  border: '1px solid transparent',
                  '&:hover': {
                    bgcolor: 'rgba(100,180,255,0.1)',
                    borderColor: 'rgba(100,180,255,0.15)',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: '0.85rem' }}>
                      {p.nombre}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 0.3 }}>
                      <Typography variant="caption" sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.65rem' }}>
                        {p.codigoInterno}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.65rem' }}>
                        {p.municipio}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(150,200,255,0.5)', fontSize: '0.65rem' }}>
                        {p.avanceFisico || 0}%
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
