import React from 'react';
import ResourcePage from '../../components/ResourcePage';
import UNITS_CONFIG from '../../config/unitMenus';

const config = UNITS_CONFIG[0].items[0];

const PlanMaestro = () => <ResourcePage config={config} title={config.label} />;
export default PlanMaestro;
