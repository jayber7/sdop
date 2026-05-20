import React from 'react';
import ResourcePage from '../../components/ResourcePage';
import UNITS_CONFIG from '../../config/unitMenus';

const config = UNITS_CONFIG[2].items[1];

const RedVial = () => <ResourcePage config={config} title={config.label} />;
export default RedVial;
