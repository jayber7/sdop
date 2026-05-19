import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Proyectos from './pages/Proyectos';
import ProyectoDetalle from './pages/ProyectoDetalle';
import Avances from './pages/Avances';
import RegistrarAvance from './pages/RegistrarAvance';
import Empresas from './pages/Empresas';
import PersonasTecnicas from './pages/PersonasTecnicas';
import HitosPresupuestarios from './pages/HitosPresupuestarios';
import FeedbackList from './pages/FeedbackList';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
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
        <Route path="proyectos/:id" element={<ProyectoDetalle />} />
        <Route path="avances" element={<Avances />} />
        <Route path="avances/nuevo" element={<RegistrarAvance />} />
        <Route path="avances/:proyectoId/nuevo" element={<RegistrarAvance />} />
        <Route path="empresas" element={<Empresas />} />
        <Route path="personas-tecnicas" element={<PersonasTecnicas />} />
        <Route path="hitos" element={<HitosPresupuestarios />} />
        <Route path="feedback" element={<FeedbackList />} />
      </Route>
    </Routes>
  );
};

export default App;
