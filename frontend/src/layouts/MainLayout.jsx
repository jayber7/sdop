import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, IconButton, Drawer,
  Box, Avatar, Menu, MenuItem, Divider,
} from '@mui/material';
import {
  Menu as MenuIcon, Feedback as FeedbackIcon, Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import FeedbackButton from '../components/FeedbackButton';
import UnitSidebar from '../components/UnitSidebar';
import api from '../services/api';

const drawerWidth = 280;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unidades, setUnidades] = useState([]);
  const [selectedUnidad, setSelectedUnidad] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchUnidades = async () => {
      try {
        const res = await api.get('/unidades');
        setUnidades(res.data.data || []);
      } catch (err) {
        console.error('Error loading unidades:', err);
      }
    };
    fetchUnidades();
  }, []);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => { logout(); navigate('/login'); };

  const drawer = (
    <UnitSidebar
      unidades={unidades}
      selectedUnidad={selectedUnidad}
      setSelectedUnidad={setSelectedUnidad}
      onLogout={handleLogout}
    />
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>SDOP - Gestión de Obras Públicas</Typography>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.nombre?.charAt(0)}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem disabled>{user?.nombre}</MenuItem>
            <MenuItem disabled sx={{ opacity: 0.7 }}>{user?.email}</MenuItem>
            <MenuItem disabled sx={{ opacity: 0.7 }}>{user?.rol}</MenuItem>
            <Divider />
            <MenuItem onClick={() => { handleMenuClose(); navigate('/feedback'); }}>
              <FeedbackIcon sx={{ mr: 1 }} fontSize="small" /> Feedback
            </MenuItem>
            <MenuItem onClick={handleLogout}><LogoutIcon sx={{ mr: 1 }} fontSize="small" /> Cerrar Sesión</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }} open>
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}>
        <Outlet context={{ selectedUnidad }} />
      </Box>
      <FeedbackButton />
    </Box>
  );
};

export default MainLayout;
