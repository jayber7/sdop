import React, { useState } from 'react';
import {
  Box, List, ListItem, ListItemIcon, ListItemText, Collapse, Divider,
  Typography, IconButton,
} from '@mui/material';
import {
  ExpandLess, ExpandMore, Dashboard as DashboardIcon,
  Engineering as ProjectsIcon, Assignment as AvancesIcon,
  Business as EmpresasIcon, People as PersonasIcon,
  AccountBalance as HitosIcon, Feedback as FeedbackIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UNITS_CONFIG from '../config/unitMenus';

const UnitSidebar = ({ unidades, selectedUnidad, setSelectedUnidad, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [expandedUnits, setExpandedUnits] = useState({});

  const userUnitIds = user?.unidadesAcceso?.map((u) => (typeof u === 'string' ? u : u._id)) || [];
  const isAdmin = user?.rol === 'ADMIN';

  const filteredUnits = isAdmin
    ? UNITS_CONFIG
    : UNITS_CONFIG.filter((u) => userUnitIds.some((id) => unidades.find((un) => un._id === id)?.codigo === u.codigo));

  const toggleUnit = (codigo) => {
    setExpandedUnits((prev) => ({ ...prev, [codigo]: !prev[codigo] }));
  };

  const isActive = (path) => location.pathname === path;

  const menuItemStyle = (path) => ({
    bgcolor: isActive(path) ? 'rgba(91,154,255,0.12)' : 'transparent',
    color: isActive(path) ? 'rgba(150,220,255,0.95)' : 'rgba(255,255,255,0.65)',
    '&:hover': {
      bgcolor: 'rgba(100,180,255,0.08)',
      color: 'rgba(255,255,255,0.85)',
    },
    borderRadius: 1.5,
    mx: 1,
    mb: 0.3,
    fontSize: '0.85rem',
  });

  const commonItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Proyectos', icon: <ProjectsIcon />, path: '/proyectos' },
    { text: 'Avances', icon: <AvancesIcon />, path: '/avances' },
  ];

  const adminItems = [];
  if (isAdmin) {
    adminItems.push({ text: 'Empresas', icon: <EmpresasIcon />, path: '/empresas' });
    adminItems.push({ text: 'Personas Técnicas', icon: <PersonasIcon />, path: '/personas-tecnicas' });
    adminItems.push({ text: 'Hitos Presupuestarios', icon: <HitosIcon />, path: '/hitos' });
  }

  return (
    <Box sx={{
      width: 280, overflowY: 'auto', height: '100%',
      '&::-webkit-scrollbar': { width: 3 },
      '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 2 },
    }}>
      <Box sx={{
        p: 2.5, textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(10,14,39,0.8) 0%, rgba(26,16,64,0.8) 100%)',
        borderBottom: '1px solid rgba(100,180,255,0.08)',
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.92)' }}>SDOP</Typography>
        <Typography variant="caption" sx={{ color: 'rgba(150,200,255,0.5)' }}>Gestión de Obras Públicas</Typography>
      </Box>
      <Divider />

      <List dense sx={{ pt: 1 }}>
        {commonItems.map((item) => (
          <ListItem key={item.text} button onClick={() => navigate(item.path)} sx={menuItemStyle(item.path)}>
            <ListItemIcon sx={{ color: 'inherit', minWidth: 36, fontSize: '1.1rem' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 500 }} />
          </ListItem>
        ))}
      </List>

      <Divider />

      {filteredUnits.map((unit) => {
        const UnitIcon = unit.icono;
        const isExpanded = expandedUnits[unit.codigo];
        return (
          <Box key={unit.codigo}>
            <ListItem
              button
              onClick={() => toggleUnit(unit.codigo)}
              sx={{
                bgcolor: isExpanded ? `${unit.color}10` : 'transparent',
                '&:hover': { bgcolor: `${unit.color}12` },
                borderRadius: 1.5,
                mx: 1,
                my: 0.3,
              }}
            >
              <ListItemIcon sx={{ color: unit.color, minWidth: 36 }}>
                <UnitIcon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary={unit.codigo}
                secondary={unit.nombre}
                primaryTypographyProps={{ fontWeight: 700, fontSize: '0.82rem', color: unit.color }}
                secondaryTypographyProps={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}
              />
              <IconButton size="small" sx={{ color: unit.color }}>
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </ListItem>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List dense component="div" disablePadding>
                {unit.items.map((item) => {
                  const ItemIcon = item.icon;
                  const itemPath = `/${unit.codigo.toLowerCase()}/${item.key}`;
                  return (
                    <ListItem
                      key={item.key}
                      button
                      onClick={() => navigate(itemPath)}
                      sx={{
                        pl: 4.5,
                        bgcolor: isActive(itemPath) ? `${unit.color}18` : 'transparent',
                        color: isActive(itemPath) ? unit.color : 'rgba(255,255,255,0.55)',
                        '&:hover': { bgcolor: `${unit.color}10`, color: unit.color },
                        borderRadius: 1.5,
                        mx: 1,
                        mb: 0.2,
                        fontSize: '0.8rem',
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit', minWidth: 28 }}>
                        <ItemIcon sx={{ fontSize: 16 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ fontSize: '0.78rem' }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Collapse>
          </Box>
        );
      })}

      <Divider />

      {adminItems.length > 0 && (
        <>
          <List dense sx={{ pt: 0.5 }}>
            {adminItems.map((item) => (
              <ListItem key={item.text} button onClick={() => navigate(item.path)} sx={menuItemStyle(item.path)}>
                <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 500 }} />
              </ListItem>
            ))}
          </List>
          <Divider />
        </>
      )}

      <List dense sx={{ pt: 0.5 }}>
        <ListItem button onClick={() => navigate('/feedback')} sx={menuItemStyle('/feedback')}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}><FeedbackIcon /></ListItemIcon>
          <ListItemText primary="Feedback" primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 500 }} />
        </ListItem>
        <ListItem button onClick={onLogout}
          sx={{ ...menuItemStyle(''), color: 'rgba(255,100,100,0.7)', '&:hover': { bgcolor: 'rgba(255,80,80,0.12)', color: 'rgba(255,120,120,0.9)' } }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 500 }} />
        </ListItem>
      </List>
    </Box>
  );
};

export default UnitSidebar;
