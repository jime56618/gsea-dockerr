import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Importación de tus componentes
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

export default function App() {
  return (
    <Routes>
      {/* 1. Ruta Raíz: Redirige al registro para que no se quede en blanco al abrir la página */}
      <Route path="/" element={<Navigate to="/landing" replace />} />
      
      {/* 2. Ruta de Registro/Login */}
      <Route path="/register" element={<AuthGSEA />} />

      {/* 3. Rutas de la Aplicación (Asegúrate de que estas rutas sean las que usas en tus botones) */}
      <Route path="/landing" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/agentes" element={<Agentes />} />
      <Route path="/tramites" element={<Tramites />} />
      <Route path="/clientes" element={<Clientes />} />
      <Route path="/seguimiento-cobranza" element={<SeguimientoCobranza />} />
      <Route path="/seguimiento-polizas" element={<SeguimintoPolizas />} />
      <Route path="/calendario" element={<Calendario />} />
      <Route path="/capacitacion" element={<Capacitacion />} />

      {/* 4. Manejo de Errores: Si la URL no existe, vuelve al inicio */}
      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}