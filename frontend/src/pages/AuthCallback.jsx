import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      login(token);
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data.data);
          navigate('/');
        })
        .catch(() => navigate('/login'));
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, login, setUser]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
      <CircularProgress />
      <Typography>Verificando sesión...</Typography>
    </Box>
  );
};

export default AuthCallback;
