import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Proyectos from './pages/Proyectos';
import ProyectoDetalle from './pages/ProyectoDetalle';
import ProyectoForm from './pages/ProyectoForm';
import Avances from './pages/Avances';
import AvanceDetalle from './pages/AvanceDetalle';
import RegistrarAvance from './pages/RegistrarAvance';
import Empresas from './pages/Empresas';
import PersonasTecnicas from './pages/PersonasTecnicas';
import HitosPresupuestarios from './pages/HitosPresupuestarios';
import FeedbackList from './pages/FeedbackList';
import Unidades from './pages/Unidades';
import Usuarios from './pages/Usuarios';
import PlanMaestro from './pages/di/PlanMaestro';
import DiagnosticoNecesidades from './pages/di/DiagnosticoNecesidades';
import PortafolioProyectos from './pages/di/PortafolioProyectos';
import PAC from './pages/di/PAC';
import ProgramacionEjecucion from './pages/di/ProgramacionEjecucion';
import PresupuestoBase from './pages/di/PresupuestoBase';
import DiagnosticoEnergetico from './pages/je/DiagnosticoEnergetico';
import RedElectrica from './pages/je/RedElectrica';
import ProyectosEnergiaRenovable from './pages/je/ProyectosEnergiaRenovable';
import EficienciaEnergetica from './pages/je/EficienciaEnergetica';
import SolicitudesFinanciamiento from './pages/je/SolicitudesFinanciamiento';
import PlanMovilidad from './pages/jt/PlanMovilidad';
import RedVial from './pages/jt/RedVial';
import MantenimientoVial from './pages/jt/MantenimientoVial';
import LicenciasVehiculo from './pages/jt/LicenciasVehiculo';
import MapasRiesgo from './pages/jupre/MapasRiesgo';
import PlanesContingencia from './pages/jupre/PlanesContingencia';
import SistemasAlerta from './pages/jupre/SistemasAlerta';
import CapacitacionesSimulacros from './pages/jupre/CapacitacionesSimulacros';
import RedAguaPotable from './pages/jus/RedAguaPotable';
import PlantasTratamiento from './pages/jus/PlantasTratamiento';
import GestionResiduos from './pages/jus/GestionResiduos';
import PlanesCoberturaSaneamiento from './pages/jus/PlanesCoberturaSaneamiento';
import GestionesAmbientales from './pages/jus/GestionesAmbientales';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="proyectos" element={<Proyectos />} />
        <Route path="proyectos/nuevo" element={<ProyectoForm />} />
        <Route path="proyectos/:id" element={<ProyectoDetalle />} />
        <Route path="proyectos/:id/editar" element={<ProyectoForm />} />
        <Route path="avances" element={<Avances />} />
        <Route path="avances/:id" element={<AvanceDetalle />} />
        <Route path="avances/nuevo" element={<RegistrarAvance />} />
        <Route path="avances/:proyectoId/nuevo" element={<RegistrarAvance />} />
        <Route path="empresas" element={<Empresas />} />
        <Route path="personas-tecnicas" element={<PersonasTecnicas />} />
        <Route path="hitos" element={<HitosPresupuestarios />} />
        <Route path="unidades" element={<Unidades />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="feedback" element={<FeedbackList />} />
        <Route path="di/planes-maestros" element={<PlanMaestro />} />
        <Route path="di/diagnostico-necesidades" element={<DiagnosticoNecesidades />} />
        <Route path="di/portafolio-proyectos" element={<PortafolioProyectos />} />
        <Route path="di/pac" element={<PAC />} />
        <Route path="di/programaciones-ejecucion" element={<ProgramacionEjecucion />} />
        <Route path="di/presupuestos-base" element={<PresupuestoBase />} />
        <Route path="je/diagnostico-energetico" element={<DiagnosticoEnergetico />} />
        <Route path="je/red-electrica" element={<RedElectrica />} />
        <Route path="je/proyectos-energia-renovable" element={<ProyectosEnergiaRenovable />} />
        <Route path="je/eficiencias-energeticas" element={<EficienciaEnergetica />} />
        <Route path="je/solicitudes-financiamiento" element={<SolicitudesFinanciamiento />} />
        <Route path="jt/planes-movilidad" element={<PlanMovilidad />} />
        <Route path="jt/red-vial" element={<RedVial />} />
        <Route path="jt/mantenimiento-vial" element={<MantenimientoVial />} />
        <Route path="jt/licencias-vehiculo" element={<LicenciasVehiculo />} />
        <Route path="jupre/mapas-riesgo" element={<MapasRiesgo />} />
        <Route path="jupre/planes-contingencia" element={<PlanesContingencia />} />
        <Route path="jupre/sistemas-alerta" element={<SistemasAlerta />} />
        <Route path="jupre/capacitaciones-simulacros" element={<CapacitacionesSimulacros />} />
        <Route path="jus/red-agua-potable" element={<RedAguaPotable />} />
        <Route path="jus/plantas-tratamiento" element={<PlantasTratamiento />} />
        <Route path="jus/gestion-residuos" element={<GestionResiduos />} />
        <Route path="jus/planes-cobertura-saneamiento" element={<PlanesCoberturaSaneamiento />} />
        <Route path="jus/gestiones-ambientales" element={<GestionesAmbientales />} />
      </Route>
    </Routes>
  );
};

export default App;
