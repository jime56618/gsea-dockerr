import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/AuthGSEA.css';
import logo from "../assets/images/logo-gsea.png";

export default function AuthGSEA() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // Hook para la redirección

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría tu lógica de validación o API
    // Por ahora, redirigimos directamente al dashboard
    navigate('/dashboard');
  };

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="gsea-auth-eye-icon">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="gsea-auth-eye-icon">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );

  return (
    <div className="gsea-auth-page-wrapper">
      <div className={`gsea-auth-main-card ${!isLogin ? 'gsea-auth-mode-register' : ''}`}>
        
        {/* --- CONTENEDOR DE FORMULARIOS --- */}
        <div className="gsea-auth-forms-container">
          
          {/* VISTA LOGIN */}
          <div className="gsea-auth-form-wrapper gsea-auth-login-view">
            <h2 className="gsea-auth-title">Bienvenido</h2>
            <p className="gsea-auth-subtitle">Acceso al sistema GSEA</p>
            
            <form className="gsea-auth-form-element" onSubmit={handleSubmit}>
              <div className="gsea-auth-field">
                <label>Dirección de Correo</label>
                <input type="email" placeholder="agente@gsea.com" required />
              </div>
              <div className="gsea-auth-field">
                <div className="gsea-auth-label-row">
                  <label style={{ width: '100%' }}>
                    Contraseña
                    <div className="gsea-auth-input-group">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        required
                      />
                      <button 
                        type="button" 
                        className="gsea-auth-eye-button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </label>
                </div>
                <a href="#" className="gsea-auth-link" style={{ display: 'block', marginTop: '5px' }}>¿Olvidaste tu contraseña?</a>
              </div>
              
              <button type="submit" className="gsea-auth-btn-primary">Iniciar Sesión</button>
            </form>

            <div className="gsea-auth-divider"><span>O continuar con</span></div>
            
            <button className="gsea-auth-btn-google" type="button" onClick={() => navigate('/dashboard')}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
              <span>Continuar con Google</span>
            </button>

            <p className="gsea-auth-footer-text">
              ¿No tienes cuenta? 
              <span className="gsea-auth-link-action" onClick={() => setIsLogin(false)}> Regístrate aquí</span>
            </p>
          </div>

          {/* VISTA REGISTRO */}
          <div className="gsea-auth-form-wrapper gsea-auth-register-view">
            <h2 className="gsea-auth-title">Registro</h2>
            <p className="gsea-auth-subtitle">Crea tu cuenta de agente</p>
            
            <form className="gsea-auth-form-element" onSubmit={handleSubmit}>
              <div className="gsea-auth-register-scrollable">
                <div className="gsea-auth-field">
                  <label>Nombre completo</label>
                  <input type="text" placeholder="Nombre Apellido" required />
                </div>
                <div className="gsea-auth-field">
                  <label>Email</label>
                  <input type="email" placeholder="correo@ejemplo.com" required />
                </div>
                <div className="gsea-auth-grid-compact">
                  <div className="gsea-auth-field">
                    <label>Contraseña</label>
                    <div className="gsea-auth-input-group">
                      <input type={showPassword ? "text" : "password"} placeholder="••••" required />
                      <button type="button" className="gsea-auth-eye-button" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                  <div className="gsea-auth-field">
                    <label>Confirmar</label>
                    <div className="gsea-auth-input-group">
                      <input type={showPassword ? "text" : "password"} placeholder="••••" required />
                      <button type="button" className="gsea-auth-eye-button" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="gsea-auth-field">
                  <label>Tipo de usuario</label>
                  <select className="gsea-auth-select">
                    <option>Agente</option>
                    <option>Promotoría</option>
                  </select>
                </div>
              </div>
              
              <button type="submit" className="gsea-auth-btn-primary">Crear cuenta</button>
            </form>

            <p className="gsea-auth-footer-text">
              ¿Ya tienes cuenta? 
              <span className="gsea-auth-link-action" onClick={() => setIsLogin(true)}> Inicia sesión</span>
            </p>
          </div>
        </div>

        {/* --- PANEL AZUL --- */}
        <div className="gsea-auth-overlay-panel">
          <div className="gsea-auth-overlay-content">
            <div className="gsea-auth-logo-box">
              <img src={logo} alt="GSEA Logo" className="gsea-auth-logo-img" />
            </div>
            <h1 className="gsea-auth-brand">GSEA CRM</h1>
            <p className="gsea-auth-description">
              Potenciando la gestión de seguros con datos reales.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}