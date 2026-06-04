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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unidades, setUnidades] = useState([]);
  const [selectedUnidad, setSelectedUnidad] = useState('');
  const [clock, setClock] = useState(new Date());
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const handleDrawerToggle = () => {
    if (window.innerWidth < 600) {
      setMobileOpen(!mobileOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };
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
          <IconButton edge="start" color="inherit" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, color: 'rgba(255,255,255,0.9)' }}>
            SDOP
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 2 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'right', lineHeight: 1.2 }}>
              <Box component="span" sx={{ display: 'block', fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem' }}>
                {user?.nombre}
              </Box>
              <Box component="span" sx={{ display: 'block', fontSize: '0.65rem' }}>
                {clock.toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' })} · {clock.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </Box>
            </Typography>
          </Box>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,180,0,0.3)', color: 'rgba(255,200,0,0.9)', fontSize: '0.85rem', fontWeight: 700 }}>
              {user?.nombre?.charAt(0)}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem disabled sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{user?.nombre}</MenuItem>
            <MenuItem disabled sx={{ opacity: 0.6, color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{user?.email}</MenuItem>
            <MenuItem disabled sx={{ opacity: 0.6, color: 'rgba(150,200,255,0.6)', fontSize: '0.8rem' }}>{user?.rol}</MenuItem>
            <Divider />
            <MenuItem onClick={() => { handleMenuClose(); navigate('/feedback'); }}>
              <FeedbackIcon sx={{ mr: 1.5, fontSize: 18 }} /> Feedback
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1.5, fontSize: 18 }} /> Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: sidebarOpen ? drawerWidth : 0 }, flexShrink: { sm: 0 }, transition: 'width 0.2s ease' }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
          {drawer}
        </Drawer>
        <Drawer variant="persistent" open={sidebarOpen}
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : 0}px)` }, mt: 8, minHeight: 'calc(100vh - 64px)', transition: 'width 0.2s ease' }}>
        <Outlet context={{ selectedUnidad }} />
      </Box>
      <FeedbackButton />
    </Box>
  );
};

export default MainLayout;
