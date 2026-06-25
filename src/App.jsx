import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import AuthGSEA from './components/AuthGSEA';
import Landing from './components/Landing';
import ProtectedRoute from './components/ProtectedRoute';
import BillingLocked from './components/BillingLocked';
import AcceptInvitation from './components/AcceptInvitation';

import Dashboard from './components/Dashboard';
import Agentes from './components/Agentes';
import Tramites from './components/Tramites';
import Clientes from './components/Clientes';
import SeguimientoCobranza from './components/SeguimientoCobranza';
import SeguimientoPolizas from './components/SeguimientoPolizas';
import Calendario from './components/Calendario';
import Capacitacion from './components/Capacitacion';

import TeamSettings from './components/TeamSettings';
import RolesEditor from './components/RolesEditor';
import BillingSettings from './components/BillingSettings';
import IntegrationsPage from './components/IntegrationsPage';

import './components/css/SaaS.css';

function AppWithAuth({ children }) {
  return (
    <AuthProvider>
      <ProtectedRoute>{children}</ProtectedRoute>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/landing" replace />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/register" element={<AuthGSEA />} />
      <Route path="/invitacion/:token" element={<AcceptInvitation />} />

      <Route
        path="/billing-locked"
        element={
          <AuthProvider>
            <BillingLocked />
          </AuthProvider>
        }
      />

      <Route path="/dashboard" element={<AppWithAuth><Dashboard /></AppWithAuth>} />
      <Route path="/agentes" element={<AppWithAuth><Agentes /></AppWithAuth>} />
      <Route path="/tramites" element={<AppWithAuth><Tramites /></AppWithAuth>} />
      <Route path="/clientes" element={<AppWithAuth><Clientes /></AppWithAuth>} />
      <Route path="/seguimiento-cobranza" element={<AppWithAuth><SeguimientoCobranza /></AppWithAuth>} />
      <Route path="/seguimiento-polizas" element={<AppWithAuth><SeguimientoPolizas /></AppWithAuth>} />
      <Route path="/calendario" element={<AppWithAuth><Calendario /></AppWithAuth>} />
      <Route path="/capacitacion" element={<AppWithAuth><Capacitacion /></AppWithAuth>} />

      <Route path="/configuracion/equipo" element={<AppWithAuth><TeamSettings /></AppWithAuth>} />
      <Route path="/configuracion/roles" element={<AppWithAuth><RolesEditor /></AppWithAuth>} />
      <Route path="/configuracion/facturacion" element={<AppWithAuth><BillingSettings /></AppWithAuth>} />
      <Route path="/integraciones" element={<AppWithAuth><IntegrationsPage /></AppWithAuth>} />

      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}
