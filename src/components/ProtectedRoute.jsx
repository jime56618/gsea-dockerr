import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TOKEN_KEY } from '../utils/constants';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem(TOKEN_KEY);
  const { loading, locked } = useAuth();

  if (!token) {
    return <Navigate to="/register" replace />;
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        Cargando sesión…
      </div>
    );
  }

  if (locked) {
    return <Navigate to="/billing-locked" replace />;
  }

  return children;
}
