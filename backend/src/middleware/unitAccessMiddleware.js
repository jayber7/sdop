const UnidadOrganizativa = require('../models/UnidadOrganizativa');

const unitAccessMiddleware = async (req, res, next) => {
  try {
    const usuario = req.usuario;
    if (!usuario) {
      return res.status(401).json({ status: 'error', message: 'No autorizado' });
    }

    if (usuario.rol === 'ADMIN') {
      req.unidadesAcceso = 'ALL';
      return next();
    }

    if (!usuario.unidadesAcceso || usuario.unidadesAcceso.length === 0) {
      req.unidadesAcceso = [];
      return next();
    }

    req.unidadesAcceso = usuario.unidadesAcceso;
    next();
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const filterByUnit = (req, res, next) => {
  if (req.unidadesAcceso === 'ALL') {
    return next();
  }

  if (!req.unidadesAcceso || req.unidadesAcceso.length === 0) {
    req.query.unidadResponsable = '__NO_ACCESS__';
    return next();
  }

  req.query.unidadResponsable = { $in: req.unidadesAcceso.map(id => id.toString()) };
  next();
};

module.exports = { unitAccessMiddleware, filterByUnit };
