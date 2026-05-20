const PERMISSION_MATRIX = {
  ADMIN: {
    proyectos: ['read', 'create', 'update', 'delete'],
    empresas: ['read', 'create', 'update', 'delete'],
    personasTecnicas: ['read', 'create', 'update', 'delete'],
    hitos: ['read', 'create', 'update', 'delete'],
    desembolsos: ['read', 'create', 'update', 'delete'],
    avances: ['read', 'create', 'update', 'delete', 'aprobar', 'observar'],
    unidades: ['read', 'create', 'update', 'delete'],
    usuarios: ['read', 'create', 'update', 'delete'],
    feedback: ['read', 'update', 'delete'],
  },
  SUPERVISOR: {
    proyectos: ['read'],
    empresas: ['read'],
    personasTecnicas: ['read'],
    hitos: ['read'],
    desembolsos: ['read'],
    avances: ['read', 'aprobar', 'observar'],
    unidades: ['read'],
    feedback: ['read', 'create'],
  },
  INSPECTOR: {
    proyectos: ['read'],
    empresas: ['read'],
    personasTecnicas: ['read'],
    hitos: ['read'],
    desembolsos: ['read'],
    avances: ['read', 'create', 'update'],
    unidades: ['read'],
    feedback: ['read', 'create'],
  },
  FISCAL: {
    proyectos: ['read'],
    empresas: ['read'],
    personasTecnicas: ['read'],
    hitos: ['read'],
    desembolsos: ['read'],
    avances: ['read'],
    unidades: ['read'],
    feedback: ['read', 'create'],
  },
  VISOR: {
    proyectos: ['read'],
    empresas: ['read'],
    personasTecnicas: ['read'],
    hitos: ['read'],
    desembolsos: ['read'],
    avances: ['read'],
    unidades: ['read'],
    feedback: ['read', 'create'],
  },
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ status: 'error', message: 'No autorizado' });
  }
  if (!roles.includes(req.usuario.rol)) {
    return res.status(403).json({ status: 'error', message: `Requiere uno de los siguientes roles: ${roles.join(', ')}` });
  }
  next();
};

const requirePermission = (resource, action) => (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ status: 'error', message: 'No autorizado' });
  }

  const rol = req.usuario.rol;
  const permissions = PERMISSION_MATRIX[rol];

  if (!permissions) {
    return res.status(403).json({ status: 'error', message: 'Rol sin permisos definidos' });
  }

  const resourcePerms = permissions[resource];
  if (!resourcePerms || !resourcePerms.includes(action)) {
    return res.status(403).json({ status: 'error', message: `Sin permiso para ${action} en ${resource}` });
  }

  next();
};

const canAccessResource = (resource, action) => (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ status: 'error', message: 'No autorizado' });
  }

  if (req.usuario.rol === 'ADMIN') {
    return next();
  }

  if (!req.usuario.unidadesAcceso || req.usuario.unidadesAcceso.length === 0) {
    return res.status(403).json({ status: 'error', message: 'Sin unidades asignadas' });
  }

  const permissions = PERMISSION_MATRIX[req.usuario.rol];
  if (!permissions || !permissions[resource] || !permissions[resource].includes(action)) {
    return res.status(403).json({ status: 'error', message: `Sin permiso para ${action} en ${resource}` });
  }

  next();
};

module.exports = { requireRole, requirePermission, canAccessResource, PERMISSION_MATRIX };
