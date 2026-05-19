import React, { useState } from 'react';
import {
  Fab, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography, MenuItem, Alert, Chip,
  IconButton, Tooltip,
} from '@mui/material';
import {
  Feedback as FeedbackIcon, Close, Send,
  BugReport, Lightbulb, Build, HelpOutline,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

const TIPO_OPTIONS = [
  { value: 'BUG', label: 'Reportar Bug', icon: <BugReport />, color: 'error' },
  { value: 'MEJORA', label: 'Sugerir Mejora', icon: <Lightbulb />, color: 'warning' },
  { value: 'NUEVA_FUNCIONALIDAD', label: 'Nueva Funcionalidad', icon: <Build />, color: 'info' },
  { value: 'OTRO', label: 'Otro', icon: <HelpOutline />, color: 'default' },
];

const PRIORIDAD_OPTIONS = [
  { value: 'BAJA', label: 'Baja', color: 'default' },
  { value: 'MEDIA', label: 'Media', color: 'info' },
  { value: 'ALTA', label: 'Alta', color: 'warning' },
  { value: 'URGENTE', label: 'Urgente', color: 'error' },
];

const FeedbackButton = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    tipo: '',
    titulo: '',
    descripcion: '',
    prioridad: 'MEDIA',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleOpen = () => {
    setOpen(true);
    setStep(1);
    setSuccess(false);
    setError(null);
    setFormData({ tipo: '', titulo: '', descripcion: '', prioridad: 'MEDIA' });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/feedback', {
        ...formData,
        pagina: location.pathname,
      });
      setSuccess(true);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTipo = TIPO_OPTIONS.find(t => t.value === formData.tipo);

  return (
    <>
      <Tooltip title="Enviar Feedback">
        <Fab
          color="primary"
          onClick={handleOpen}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1200,
            boxShadow: 6,
            '&:hover': { transform: 'scale(1.1)' },
            transition: 'transform 0.2s',
          }}
        >
          <FeedbackIcon />
        </Fab>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FeedbackIcon color="primary" />
            <Typography variant="h6">Enviar Feedback</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {success ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>¡Gracias por tu feedback!</Typography>
              <Typography color="text.secondary">
                Tu reporte ha sido enviado. Lo revisaremos lo antes posible.
              </Typography>
              <Chip label={formData.tipo} color={selectedTipo?.color || 'default'} sx={{ mt: 2 }} />
            </Box>
          ) : step === 1 ? (
            <Box sx={{ py: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                ¿Qué tipo de feedback quieres enviar?
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {TIPO_OPTIONS.map((tipo) => (
                  <Button
                    key={tipo.value}
                    variant={formData.tipo === tipo.value ? 'contained' : 'outlined'}
                    color={tipo.color}
                    onClick={() => setFormData({ ...formData, tipo: tipo.value })}
                    sx={{
                      py: 2,
                      flexDirection: 'column',
                      gap: 1,
                      minHeight: 80,
                      borderWidth: 2,
                    }}
                  >
                    {tipo.icon}
                    <Typography variant="body2">{tipo.label}</Typography>
                  </Button>
                ))}
              </Box>
            </Box>
          ) : step === 2 ? (
            <Box sx={{ py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Chip label={selectedTipo?.label} color={selectedTipo?.color} size="small" icon={selectedTipo?.icon} />
                <Typography variant="caption" color="text.secondary">
                  Página: {location.pathname}
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Título"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                sx={{ mb: 2 }}
                placeholder="Describe brevemente el problema o sugerencia"
                inputProps={{ maxLength: 100 }}
              />

              <TextField
                fullWidth
                label="Descripción"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                multiline
                rows={4}
                sx={{ mb: 2 }}
                placeholder="Explica con detalle qué sucede o qué te gustaría ver..."
                inputProps={{ maxLength: 1000 }}
              />

              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Prioridad
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {PRIORIDAD_OPTIONS.map((p) => (
                  <Chip
                    key={p.value}
                    label={p.label}
                    color={p.color}
                    variant={formData.prioridad === p.value ? 'filled' : 'outlined'}
                    onClick={() => setFormData({ ...formData, prioridad: p.value })}
                    clickable
                  />
                ))}
              </Box>

              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </Box>
          ) : null}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          {step === 1 && (
            <>
              <Button onClick={handleClose}>Cancelar</Button>
              <Button
                variant="contained"
                disabled={!formData.tipo}
                onClick={() => setStep(2)}
              >
                Siguiente
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button onClick={() => setStep(1)}>Atrás</Button>
              <Button
                variant="contained"
                startIcon={<Send />}
                disabled={!formData.titulo || !formData.descripcion || submitting}
                onClick={handleSubmit}
              >
                {submitting ? 'Enviando...' : 'Enviar Feedback'}
              </Button>
            </>
          )}
          {step === 3 && (
            <Button variant="contained" onClick={handleClose} fullWidth>
              Cerrar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FeedbackButton;
