import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button, MenuItem,
  Alert, LinearProgress, Chip, Divider, IconButton,
} from '@mui/material';
import { Save, ArrowBack, Delete, MyLocation } from '@mui/icons-material';
import api from '../services/api';

const TIPOS = ['CAMINO', 'PUENTE', 'ELECTRIFICACION', 'AGUA_POTABLE', 'SANEAMIENTO', 'EDIFICACION', 'OTRO'];
const ESTADOS = ['PRE_INVERSION', 'DISEÑO', 'LICITACION', 'EJECUCION', 'SUSPENDIDO', 'CONCLUIDO', 'ENTREGADO'];
const FUENTES = ['TGN', 'IDH', 'COMPETENCIA', 'CREDITO', 'OTRO'];
const CONTRATACION = ['CONVOCATORIA_PUBLICA', 'CONTRATACION_DIRECTA', 'MENOR'];

const ProyectoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [formData, setFormData] = useState({
    codigoInterno: '', codigoSisin: '', nombre: '', tipo: 'CAMINO',
    departamento: 'Oruro', provincia: '', municipio: '', comunidad: '',
    coordenadas: { lat: '', lng: '' },
    presupuestoTotal: '', fuenteFinanciamiento: 'TGN', moneda: 'BOB',
    estado: 'PRE_INVERSION', estadoLicitacion: '',
    empresaId: '', supervisorId: '', inspectorId: '', fiscalId: '',
    fechaInicioContrato: '', fechaFinContrato: '', plazoDias: '',
    fechaInicioEjecucion: '', fechaFinEjecucion: '', diasProrroga: 0,
    numeroContrato: '', modalidadContratacion: '', garantiaContrato: '',
    observaciones: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, perRes] = await Promise.all([
          api.get('/gestion/empresas'),
          api.get('/gestion/personas-tecnicas'),
        ]);
        setEmpresas(empRes.data.data);
        setPersonas(perRes.data.data);

        if (isEdit) {
          const res = await api.get(`/gestion/proyectos/${id}`);
          const p = res.data.data;
          setFormData({
            codigoInterno: p.codigoInterno || '',
            codigoSisin: p.codigoSisin || '',
            nombre: p.nombre || '',
            tipo: p.tipo || 'CAMINO',
            departamento: p.departamento || 'Oruro',
            provincia: p.provincia || '',
            municipio: p.municipio || '',
            comunidad: p.comunidad || '',
            coordenadas: { lat: p.coordenadas?.lat || '', lng: p.coordenadas?.lng || '' },
            presupuestoTotal: p.presupuestoTotal || '',
            fuenteFinanciamiento: p.fuenteFinanciamiento || 'TGN',
            moneda: p.moneda || 'BOB',
            estado: p.estado || 'PRE_INVERSION',
            estadoLicitacion: p.estadoLicitacion || '',
            empresaId: p.empresaId?._id || p.empresaId || '',
            supervisorId: p.supervisorId?._id || p.supervisorId || '',
            inspectorId: p.inspectorId?._id || p.inspectorId || '',
            fiscalId: p.fiscalId?._id || p.fiscalId || '',
            fechaInicioContrato: p.fechaInicioContrato ? p.fechaInicioContrato.split('T')[0] : '',
            fechaFinContrato: p.fechaFinContrato ? p.fechaFinContrato.split('T')[0] : '',
            plazoDias: p.plazoDias || '',
            fechaInicioEjecucion: p.fechaInicioEjecucion ? p.fechaInicioEjecucion.split('T')[0] : '',
            fechaFinEjecucion: p.fechaFinEjecucion ? p.fechaFinEjecucion.split('T')[0] : '',
            diasProrroga: p.diasProrroga || 0,
            numeroContrato: p.numeroContrato || '',
            modalidadContratacion: p.modalidadContratacion || '',
            garantiaContrato: p.garantiaContrato || '',
            observaciones: p.observaciones || '',
          });
        }
      } catch (err) {
        setError('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setFormData({
        ...formData,
        coordenadas: { lat: pos.coords.latitude, lng: pos.coords.longitude },
      }),
      () => setError('No se pudo obtener la ubicación'),
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const data = {
        ...formData,
        presupuestoTotal: parseFloat(formData.presupuestoTotal) || 0,
        plazoDias: parseInt(formData.plazoDias) || 0,
        diasProrroga: parseInt(formData.diasProrroga) || 0,
        garantiaContrato: parseFloat(formData.garantiaContrato) || 0,
        coordenadas: {
          lat: parseFloat(formData.coordenadas.lat) || null,
          lng: parseFloat(formData.coordenadas.lng) || null,
        },
      };

      if (isEdit) {
        await api.put(`/gestion/proyectos/${id}`, data);
      } else {
        await api.post('/gestion/proyectos', data);
      }
      setSuccess(true);
      setTimeout(() => navigate(isEdit ? `/proyectos/${id}` : '/proyectos'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar este proyecto?')) return;
    try {
      await api.delete(`/gestion/proyectos/${id}`);
      navigate('/proyectos');
    } catch (err) {
      setError('Error al eliminar');
    }
  };

  if (loading) return <Box sx={{ p: 3 }}><LinearProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate(isEdit ? `/proyectos/${id}` : '/proyectos')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {isEdit ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          </Typography>
        </Box>
        {isEdit && (
          <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleDelete}>
            Eliminar
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Proyecto guardado exitosamente</Alert>}

      <Grid container spacing={3}>
        {/* Información básica */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Información Básica</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth size="small" label="Código Interno *" required
                    value={formData.codigoInterno}
                    onChange={(e) => setFormData({ ...formData, codigoInterno: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth size="small" label="Código SISIN"
                    value={formData.codigoSisin}
                    onChange={(e) => setFormData({ ...formData, codigoSisin: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField select fullWidth size="small" label="Tipo *" required
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}>
                    {TIPOS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Nombre del Proyecto *" required multiline rows={2}
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth size="small" label="Departamento"
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth size="small" label="Provincia"
                    value={formData.provincia}
                    onChange={(e) => setFormData({ ...formData, provincia: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth size="small" label="Municipio"
                    value={formData.municipio}
                    onChange={(e) => setFormData({ ...formData, municipio: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth size="small" label="Comunidad"
                    value={formData.comunidad}
                    onChange={(e) => setFormData({ ...formData, comunidad: e.target.value })} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Presupuesto y estado */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Presupuesto y Estado</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth size="small" label="Presupuesto Total (Bs) *" required type="number"
                    value={formData.presupuestoTotal}
                    onChange={(e) => setFormData({ ...formData, presupuestoTotal: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField select fullWidth size="small" label="Fuente de Financiamiento"
                    value={formData.fuenteFinanciamiento}
                    onChange={(e) => setFormData({ ...formData, fuenteFinanciamiento: e.target.value })}>
                    {FUENTES.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField select fullWidth size="small" label="Estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}>
                    {ESTADOS.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField select fullWidth size="small" label="Estado Licitación"
                    value={formData.estadoLicitacion}
                    onChange={(e) => setFormData({ ...formData, estadoLicitacion: e.target.value })}>
                    <MenuItem value="">N/A</MenuItem>
                    {['CONVOCATORIA', 'ADJUDICADA', 'DECLARADA_DESIERTA', 'CONTRATADA'].map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Coordenadas */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Coordenadas GPS</Typography>
                <Button size="small" startIcon={<MyLocation />} onClick={getCurrentLocation}>
                  Obtener ubicación actual
                </Button>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Latitud" type="number"
                    value={formData.coordenadas.lat}
                    onChange={(e) => setFormData({ ...formData, coordenadas: { ...formData.coordenadas, lat: e.target.value } })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Longitud" type="number"
                    value={formData.coordenadas.lng}
                    onChange={(e) => setFormData({ ...formData, coordenadas: { ...formData.coordenadas, lng: e.target.value } })} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Contrato */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Contrato</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth size="small" label="Número de Contrato"
                    value={formData.numeroContrato}
                    onChange={(e) => setFormData({ ...formData, numeroContrato: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField select fullWidth size="small" label="Modalidad de Contratación"
                    value={formData.modalidadContratacion}
                    onChange={(e) => setFormData({ ...formData, modalidadContratacion: e.target.value })}>
                    <MenuItem value="">N/A</MenuItem>
                    {CONTRATACION.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth size="small" label="Garantía de Contrato (Bs)" type="number"
                    value={formData.garantiaContrato}
                    onChange={(e) => setFormData({ ...formData, garantiaContrato: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth size="small" label="Fecha Inicio Contrato" type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.fechaInicioContrato}
                    onChange={(e) => setFormData({ ...formData, fechaInicioContrato: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth size="small" label="Fecha Fin Contrato" type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.fechaFinContrato}
                    onChange={(e) => setFormData({ ...formData, fechaFinContrato: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth size="small" label="Plazo (días)" type="number"
                    value={formData.plazoDias}
                    onChange={(e) => setFormData({ ...formData, plazoDias: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth size="small" label="Días Prórroga" type="number"
                    value={formData.diasProrroga}
                    onChange={(e) => setFormData({ ...formData, diasProrroga: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth size="small" label="Fecha Inicio Ejecución" type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.fechaInicioEjecucion}
                    onChange={(e) => setFormData({ ...formData, fechaInicioEjecucion: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth size="small" label="Fecha Fin Ejecución" type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.fechaFinEjecucion}
                    onChange={(e) => setFormData({ ...formData, fechaFinEjecucion: e.target.value })} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Actores */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Actores del Proyecto</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth size="small" label="Empresa Constructora"
                    value={formData.empresaId}
                    onChange={(e) => setFormData({ ...formData, empresaId: e.target.value })}>
                    <MenuItem value="">Seleccionar...</MenuItem>
                    {empresas.map(e => <MenuItem key={e._id} value={e._id}>{e.nombre}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth size="small" label="Supervisor"
                    value={formData.supervisorId}
                    onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}>
                    <MenuItem value="">Seleccionar...</MenuItem>
                    {personas.filter(p => p.rol === 'SUPERVISOR').map(p => <MenuItem key={p._id} value={p._id}>{p.nombreCompleto}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth size="small" label="Inspector"
                    value={formData.inspectorId}
                    onChange={(e) => setFormData({ ...formData, inspectorId: e.target.value })}>
                    <MenuItem value="">Seleccionar...</MenuItem>
                    {personas.filter(p => p.rol === 'INSPECTOR').map(p => <MenuItem key={p._id} value={p._id}>{p.nombreCompleto}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth size="small" label="Fiscal"
                    value={formData.fiscalId}
                    onChange={(e) => setFormData({ ...formData, fiscalId: e.target.value })}>
                    <MenuItem value="">Seleccionar...</MenuItem>
                    {personas.filter(p => p.rol === 'FISCAL').map(p => <MenuItem key={p._id} value={p._id}>{p.nombreCompleto}</MenuItem>)}
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Observaciones */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Observaciones</Typography>
              <TextField fullWidth size="small" label="Observaciones" multiline rows={3}
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} />
            </CardContent>
          </Card>
        </Grid>

        {/* Botones */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" startIcon={<Save />} onClick={handleSubmit}
              disabled={submitting || !formData.codigoInterno || !formData.nombre || !formData.presupuestoTotal}
              fullWidth>
              {submitting ? 'Guardando...' : isEdit ? 'Actualizar Proyecto' : 'Crear Proyecto'}
            </Button>
            <Button variant="outlined" onClick={() => navigate(isEdit ? `/proyectos/${id}` : '/proyectos')}>
              Cancelar
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProyectoForm;
