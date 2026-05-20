import React from 'react';
import ResourcePage from '../../components/ResourcePage';
import UNITS_CONFIG from '../../config/unitMenus';

const config = UNITS_CONFIG[1].items[1];

const RedElectrica = () => <ResourcePage config={config} title={config.label} />;
export default RedElectrica;
