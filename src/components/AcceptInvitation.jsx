import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API_URL } from '../utils/constants';
import './css/SaaS.css';

export default function AcceptInvitation() {
  const { token } = useParams();
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [needsRegister, setNeedsRegister] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/invitations/token/${token}`, { headers: { Accept: 'application/json' } })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) throw new Error(d.message || 'Invitación inválida');
        setPreview(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const body = { token };
      if (needsRegister) {
        body.name = name;
        body.password = password;
        body.password_confirmation = passwordConfirmation;
      }
      const res = await fetch(`${API_URL}/invitations/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'registration_required') {
          setNeedsRegister(true);
          setError('Crea una contraseña para completar el registro.');
          return;
        }
        throw new Error(data.message || 'No se pudo aceptar');
      }
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const card = (content) => (
    <div className="gsea-invite-page">
      <div className="gsea-invite-card">{content}</div>
    </div>
  );

  if (loading) {
    return card(<p style={{ textAlign: 'center', color: '#64748b' }}>Cargando invitación…</p>);
  }

  if (error && !preview) {
    return card(
      <>
        <p className="gsea-invite-brand">GSEA CRM</p>
        <h1>Invitación no válida</h1>
        <p className="gsea-invite-meta">{error}</p>
        <Link to="/register" className="gsea-billing-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
          Ir al login
        </Link>
      </>
    );
  }

  if (done) {
    return card(
      <>
        <p className="gsea-invite-brand">GSEA CRM</p>
        <h1>¡Bienvenido!</h1>
        <p className="gsea-invite-meta">
          Tu cuenta quedó lista. Inicia sesión con <strong>{preview?.email}</strong>
        </p>
        <Link to="/register" className="gsea-billing-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
          Iniciar sesión
        </Link>
      </>
    );
  }

  return card(
    <>
      <p className="gsea-invite-brand">GSEA CRM</p>
      <h1>Unirte a {preview?.workspace?.nombre}</h1>
      <p className="gsea-invite-meta">
        Rol: <strong>{preview?.role?.nombre}</strong>
        <br />
        {preview?.email}
      </p>
      <form onSubmit={handleAccept}>
        {needsRegister && (
          <>
            <label className="gsea-label">Nombre completo</label>
            <input className="gsea-input" value={name} onChange={(e) => setName(e.target.value)} required />
            <label className="gsea-label">Contraseña</label>
            <input
              className="gsea-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label className="gsea-label">Confirmar contraseña</label>
            <input
              className="gsea-input"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />
          </>
        )}
        {error && <p className="gsea-msg gsea-msg--error">{error}</p>}
        <button type="submit" className="gsea-billing-btn" disabled={submitting}>
          {submitting ? 'Procesando…' : 'Aceptar invitación'}
        </button>
      </form>
    </>
  );
}
