import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Box, Divider, Avatar, Menu, MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard as DashboardIcon, Engineering as ProjectsIcon,
  Assignment as AvancesIcon, Business as EmpresasIcon, People as PersonasIcon,
  AccountBalance as HitosIcon, Logout as LogoutIcon, Feedback as FeedbackIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import FeedbackButton from '../components/FeedbackButton';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Proyectos', icon: <ProjectsIcon />, path: '/proyectos' },
  { text: 'Avances', icon: <AvancesIcon />, path: '/avances' },
  { text: 'Empresas', icon: <EmpresasIcon />, path: '/empresas' },
  { text: 'Personas Técnicas', icon: <PersonasIcon />, path: '/personas-tecnicas' },
  { text: 'Hitos Presupuestarios', icon: <HitosIcon />, path: '/hitos' },
];

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => { logout(); navigate('/login'); };

  const drawer = (
    <Box sx={{ width: drawerWidth }}>
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>SDOP</Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>Gestión de Obras Públicas</Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            button
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            sx={{
              bgcolor: location.pathname === item.path ? 'primary.light' : 'transparent',
              color: location.pathname === item.path ? 'white' : 'inherit',
              '&:hover': { bgcolor: 'primary.light', color: 'white' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem
          button
          onClick={() => { navigate('/feedback'); setMobileOpen(false); }}
          sx={{
            bgcolor: location.pathname === '/feedback' ? 'warning.light' : 'transparent',
            color: location.pathname === '/feedback' ? 'white' : 'inherit',
            '&:hover': { bgcolor: 'warning.light', color: 'white' },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}><FeedbackIcon /></ListItemIcon>
          <ListItemText primary="Feedback" />
        </ListItem>
      </List>
    </Box>
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
        <Outlet />
      </Box>
      <FeedbackButton />
    </Box>
  );
};

export default MainLayout;
