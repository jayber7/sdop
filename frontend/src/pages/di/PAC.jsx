import React from 'react';
import ResourcePage from '../../components/ResourcePage';
import UNITS_CONFIG from '../../config/unitMenus';

const config = UNITS_CONFIG[0].items[3];

const PAC = () => <ResourcePage config={config} title={config.label} />;
export default PAC;
