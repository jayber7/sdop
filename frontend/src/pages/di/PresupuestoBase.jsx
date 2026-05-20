import React from 'react';
import ResourcePage from '../../components/ResourcePage';
import UNITS_CONFIG from '../../config/unitMenus';

const config = UNITS_CONFIG[0].items[5];

const PresupuestoBase = () => <ResourcePage config={config} title={config.label} />;
export default PresupuestoBase;
