import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AuthGSEA from "./components/AuthGSEA";
import Dashboard from "./components/Dashboard";
import Agentes from "./components/Agentes";
import Tramites from "./components/Tramites";
import Clientes from "./components/Clientes";
import SeguimientoCobranza from "./components/SeguimientoCobranza";
import SeguimintoPolizas from "./components/SeguimientoPolizas";
import Calendario from "./components/Calendario";
import Capacitacion from "./components/Capacitacion";
import Landing from "./components/Landing";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/landing" replace />} />

      <Route path="/register" element={<AuthGSEA />} />
      <Route path="/landing" element={<Landing />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/agentes"
        element={
          <ProtectedRoute>
            <Agentes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tramites"
        element={
          <ProtectedRoute>
            <Tramites />
          </ProtectedRoute>
        }
      />

      <Route
        path="/clientes"
        element={
          <ProtectedRoute>
            <Clientes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/seguimiento-cobranza"
        element={
          <ProtectedRoute>
            <SeguimientoCobranza />
          </ProtectedRoute>
        }
      />

      <Route
        path="/seguimiento-polizas"
        element={
          <ProtectedRoute>
            <SeguimintoPolizas />
          </ProtectedRoute>
        }
      />

      <Route
        path="/calendario"
        element={
          <ProtectedRoute>
            <Calendario />
          </ProtectedRoute>
        }
      />

      <Route
        path="/capacitacion"
        element={
          <ProtectedRoute>
            <Capacitacion />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}