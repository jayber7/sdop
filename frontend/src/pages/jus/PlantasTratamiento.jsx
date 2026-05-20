import React from 'react';
import ResourcePage from '../../components/ResourcePage';
import UNITS_CONFIG from '../../config/unitMenus';

const config = UNITS_CONFIG[4].items[1];

const PlantasTratamiento = () => <ResourcePage config={config} title={config.label} />;
export default PlantasTratamiento;
