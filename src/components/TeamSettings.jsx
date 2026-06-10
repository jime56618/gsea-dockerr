import React, { useCallback, useEffect, useState } from 'react';
import { Users, Mail, Copy, Check, UserPlus } from 'lucide-react';
import PageLayout, { ConfigPageHeader } from './PageLayout';
import { apiFetch, ApiError } from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';
import { getActiveWorkspaceId } from '../utils/workspaceStorage';
import './css/SaaS.css';

export default function TeamSettings() {
  const { can, currentWorkspace } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const workspaceId = getActiveWorkspaceId();

  const load = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const [invRes, rolesRes] = await Promise.all([
        apiFetch('/invitations?per_page=50'),
        apiFetch('/roles'),
      ]);
      setInvitations(invRes.data || invRes || []);
      setRoles(rolesRes.data || rolesRes || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setInviteLink('');
    setCopied(false);
    try {
      const inv = await apiFetch('/invitations', {
        method: 'POST',
        body: JSON.stringify({ email, role_id: Number(roleId) }),
      });
      const base = window.location.origin;
      setInviteLink(`${base}/invitacion/${inv.token}`);
      setEmail('');
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al invitar');
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (!can('users.invite')) {
    return (
      <PageLayout>
        <div className="gsea-config-empty">
          <Users size={40} className="gsea-config-empty__icon" />
          <p>No tienes permiso para gestionar invitaciones.</p>
        </div>
      </PageLayout>
    );
  }

  const list = Array.isArray(invitations) ? invitations : [];

  return (
    <PageLayout>
      <ConfigPageHeader
        icon={Users}
        title="Equipo e invitaciones"
        subtitle={`Invita colaboradores a ${currentWorkspace?.nombre || 'tu promotoría'}. No inician un trial nuevo.`}
      />

      <div className="gsea-config-grid gsea-config-grid--2">
        <div className="gsea-card gsea-card--section">
          <h2 className="gsea-card__title">
            <UserPlus size={18} /> Nueva invitación
          </h2>
          <form onSubmit={handleInvite} className="gsea-form">
            <label className="gsea-label">Correo electrónico</label>
            <div className="gsea-input-icon-wrap">
              <Mail size={16} className="gsea-input-icon" />
              <input
                className="gsea-input gsea-input--icon"
                type="email"
                placeholder="colaborador@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <label className="gsea-label">Rol asignado</label>
            <select
              className="gsea-select"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              required
            >
              <option value="">Selecciona rol</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre} {r.is_system ? '(sistema)' : ''}
                </option>
              ))}
            </select>
            {error && <p className="gsea-msg gsea-msg--error">{error}</p>}
            <button type="submit" className="gsea-btn-primary" disabled={saving}>
              {saving ? 'Enviando…' : 'Crear invitación'}
            </button>
          </form>

          {inviteLink && (
            <div className="gsea-invite-link-box">
              <p className="gsea-label">Enlace para el invitado</p>
              <div className="gsea-invite-link-row">
                <code className="gsea-invite-link-text">{inviteLink}</code>
                <button type="button" className="gsea-btn-icon" onClick={copyLink} title="Copiar">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="gsea-card gsea-card--section gsea-card--stats">
          <span className="gsea-stat-card__label">Invitaciones</span>
          <p className="gsea-stat-card__value">{list.length}</p>
          <p className="gsea-stat-card__hint">
            {list.filter((i) => !i.used).length} pendientes ·{' '}
            {list.filter((i) => i.used).length} aceptadas
          </p>
        </div>
      </div>

      <div className="gsea-card gsea-card--section">
        <h2 className="gsea-card__title">Historial de invitaciones</h2>
        {loading ? (
          <p className="gsea-config-loading">Cargando…</p>
        ) : list.length === 0 ? (
          <p className="gsea-config-muted">Aún no hay invitaciones. Crea la primera arriba.</p>
        ) : (
          <div className="gsea-table-wrap">
            <table className="gsea-table gsea-table--styled">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Expira</th>
                </tr>
              </thead>
              <tbody>
                {list.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.email}</td>
                    <td>{inv.role?.nombre || inv.role_id}</td>
                    <td>
                      <span className={`gsea-badge ${inv.used ? 'gsea-badge--muted' : 'gsea-badge--success'}`}>
                        {inv.used ? 'Aceptada' : 'Pendiente'}
                      </span>
                    </td>
                    <td>
                      {inv.expires_at
                        ? new Date(inv.expires_at).toLocaleDateString('es-MX')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
