import React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { Google as GoogleIcon, Engineering } from '@mui/icons-material';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Login = () => {
  const handleGoogleLogin = () => {
    const baseUrl = API_URL.replace(/\/api$/, '');
    window.open(`${baseUrl}/api/auth/google`, '_self');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ maxWidth: 420, width: '100%', borderRadius: 3 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Engineering sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>SDOP</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Sistema de Gestión y Control de Obras Públicas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Secretaría Departamental de Obras Públicas - Oruro
          </Typography>
          <Button variant="contained" size="large" fullWidth startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{ bgcolor: '#4285F4', '&:hover': { bgcolor: '#3367D6' }, py: 1.5 }}>
            Iniciar sesión con Google
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
