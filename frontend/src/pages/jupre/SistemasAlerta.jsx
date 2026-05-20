import React from 'react';
import ResourcePage from '../../components/ResourcePage';
import UNITS_CONFIG from '../../config/unitMenus';

const config = UNITS_CONFIG[3].items[2];

const SistemasAlerta = () => <ResourcePage config={config} title={config.label} />;
export default SistemasAlerta;
