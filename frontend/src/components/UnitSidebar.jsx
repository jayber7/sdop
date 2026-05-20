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
    bgcolor: isActive(path) ? 'primary.light' : 'transparent',
    color: isActive(path) ? 'white' : 'inherit',
    '&:hover': { bgcolor: 'primary.light', color: 'white' },
    borderRadius: 1,
    mx: 1,
    mb: 0.5,
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
    <Box sx={{ width: 280, overflowY: 'auto', height: '100%' }}>
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>SDOP</Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>Gestión de Obras Públicas</Typography>
      </Box>
      <Divider />

      <List dense>
        {commonItems.map((item) => (
          <ListItem key={item.text} button onClick={() => navigate(item.path)} sx={menuItemStyle(item.path)}>
            <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
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
                bgcolor: isExpanded ? `${unit.color}15` : 'transparent',
                '&:hover': { bgcolor: `${unit.color}15` },
                borderRadius: 1,
                mx: 1,
                my: 0.5,
              }}
            >
              <ListItemIcon sx={{ color: unit.color, minWidth: 36 }}>
                <UnitIcon />
              </ListItemIcon>
              <ListItemText primary={unit.codigo} secondary={unit.nombre}
                primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem', color: unit.color }}
                secondaryTypographyProps={{ fontSize: '0.7rem', color: 'text.secondary' }} />
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
                        pl: 4,
                        bgcolor: isActive(itemPath) ? `${unit.color}25` : 'transparent',
                        color: isActive(itemPath) ? unit.color : 'inherit',
                        '&:hover': { bgcolor: `${unit.color}15`, color: unit.color },
                        borderRadius: 1,
                        mx: 1,
                        mb: 0.5,
                        fontSize: '0.8rem',
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit', minWidth: 30 }}>
                        <ItemIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={item.label} />
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
          <List dense>
            {adminItems.map((item) => (
              <ListItem key={item.text} button onClick={() => navigate(item.path)} sx={menuItemStyle(item.path)}>
                <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          <Divider />
        </>
      )}

      <List dense>
        <ListItem button onClick={() => navigate('/feedback')} sx={menuItemStyle('/feedback')}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}><FeedbackIcon /></ListItemIcon>
          <ListItemText primary="Feedback" />
        </ListItem>
        <ListItem button onClick={onLogout} sx={{ ...menuItemStyle(''), color: 'error.main', '&:hover': { bgcolor: 'error.light', color: 'white' } }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItem>
      </List>
    </Box>
  );
};

export default UnitSidebar;
