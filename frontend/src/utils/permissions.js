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
    avances: ['read', 'create', 'update', 'aprobar', 'observar'],
    unidades: ['read'],
    feedback: ['read', 'create'],
  },
  INSPECTOR: {
    proyectos: ['read'],
    empresas: ['read'],
    personasTecnicas: ['read'],
    hitos: ['read'],
    desembolsos: ['read'],
    avances: ['read', 'create'],
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

export const can = (user, resource, action) => {
  if (!user?.rol) return false;
  if (user.permisos && user.permisos[resource] !== undefined) {
    return user.permisos[resource].includes(action);
  }
  return PERMISSION_MATRIX[user.rol]?.[resource]?.includes(action) ?? false;
};

export const getDefaultPermissions = (rol) => PERMISSION_MATRIX[rol] || {};

export const RESOURCE_ACTIONS = {
  proyectos: ['read', 'create', 'update', 'delete'],
  empresas: ['read', 'create', 'update', 'delete'],
  personasTecnicas: ['read', 'create', 'update', 'delete'],
  hitos: ['read', 'create', 'update', 'delete'],
  desembolsos: ['read', 'create', 'update', 'delete'],
  avances: ['read', 'create', 'update', 'delete', 'aprobar', 'observar'],
  unidades: ['read', 'create', 'update', 'delete'],
  usuarios: ['read', 'create', 'update', 'delete'],
  feedback: ['read', 'create', 'update', 'delete'],
};
