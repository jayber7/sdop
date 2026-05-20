import React from 'react';
import ResourcePage from '../../components/ResourcePage';
import UNITS_CONFIG from '../../config/unitMenus';

const config = UNITS_CONFIG[2].items[3];

const LicenciasVehiculo = () => <ResourcePage config={config} title={config.label} />;
export default LicenciasVehiculo;
