import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, Lock, Users, FileText, UserCheck } from 'lucide-react';
import PageLayout, { ConfigPageHeader } from './PageLayout';
import { apiFetch } from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';
import { getActiveWorkspaceId } from '../utils/workspaceStorage';
import './css/SaaS.css';

function StatusBadge({ accessible, status }) {
  if (accessible) {
    return (
      <span className="gsea-badge gsea-badge--success">
        <CheckCircle2 size={14} /> Acceso activo
      </span>
    );
  }
  return (
    <span className="gsea-badge gsea-badge--danger">
      <Lock size={14} /> Bloqueado
    </span>
  );
}

export default function BillingSettings() {
  const { subscription, refresh, can, currentWorkspace } = useAuth();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [msg, setMsg] = useState('');

  const workspaceId = getActiveWorkspaceId();

  useEffect(() => {
    if (!workspaceId) return;
    apiFetch(`/workspaces/${workspaceId}/billing`)
      .then(setDetail)
      .catch((e) => setMsg(e.message))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  const handleActivate = async () => {
    setActivating(true);
    setMsg('');
    try {
      await apiFetch(`/workspaces/${workspaceId}/billing/activate`, { method: 'POST' });
      await refresh();
      const d = await apiFetch(`/workspaces/${workspaceId}/billing`);
      setDetail(d);
      setMsg('Plan activado correctamente.');
    } catch (e) {
      setMsg(e.message);
    } finally {
      setActivating(false);
    }
  };

  const sub = detail?.subscription || subscription;

  if (!can('billing.manage')) {
    return (
      <PageLayout>
        <div className="gsea-config-empty">
          <Lock size={40} className="gsea-config-empty__icon" />
          <p>No tienes permiso para ver facturación.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <ConfigPageHeader
        icon={CreditCard}
        title="Facturación"
        subtitle={`Suscripción y plan de ${currentWorkspace?.nombre || 'tu promotoría'}.`}
      />

      {loading ? (
        <p className="gsea-config-loading">Cargando información de facturación…</p>
      ) : (
        <>
          <div className="gsea-config-grid gsea-config-grid--3">
            <div className="gsea-stat-card">
              <span className="gsea-stat-card__label">Estado</span>
              <p className="gsea-stat-card__value gsea-stat-card__value--sm">
                {sub?.status === 'trialing' ? 'Periodo de prueba' : sub?.status || '—'}
              </p>
              <StatusBadge accessible={sub?.is_accessible} status={sub?.status} />
            </div>
            {sub?.days_left != null && sub.status === 'trialing' && (
              <div className="gsea-stat-card gsea-stat-card--accent">
                <span className="gsea-stat-card__label">Días restantes</span>
                <p className="gsea-stat-card__value">{sub.days_left}</p>
              </div>
            )}
            {sub?.plan && (
              <div className="gsea-stat-card">
                <span className="gsea-stat-card__label">Plan</span>
                <p className="gsea-stat-card__value gsea-stat-card__value--sm">{sub.plan.nombre}</p>
                <p className="gsea-stat-card__hint">${sub.plan.precio_mensual}/mes</p>
              </div>
            )}
          </div>

          {sub?.usage && (
            <div className="gsea-card gsea-card--section">
              <h2 className="gsea-card__title">Uso del workspace</h2>
              <div className="gsea-usage-grid">
                <div className="gsea-usage-item">
                  <Users size={20} />
                  <span>{sub.usage.users} usuarios</span>
                </div>
                <div className="gsea-usage-item">
                  <FileText size={20} />
                  <span>{sub.usage.polizas} pólizas</span>
                </div>
                <div className="gsea-usage-item">
                  <UserCheck size={20} />
                  <span>{sub.usage.agentes} agentes</span>
                </div>
              </div>
            </div>
          )}

          <div className="gsea-card gsea-card--section">
            {msg && (
              <p className={msg.includes('correctamente') ? 'gsea-msg gsea-msg--ok' : 'gsea-msg gsea-msg--error'}>
                {msg}
              </p>
            )}
            {(sub?.is_locked || !sub?.is_accessible) && (
              <button
                type="button"
                className="gsea-btn-primary gsea-btn-primary--lg"
                disabled={activating}
                onClick={handleActivate}
              >
                {activating ? 'Procesando…' : 'Activar plan (demo sin Stripe)'}
              </button>
            )}
            {sub?.is_accessible && !sub?.is_locked && (
              <p className="gsea-config-muted">Tu suscripción está activa. Integración con Stripe pendiente.</p>
            )}
          </div>
        </>
      )}
    </PageLayout>
  );
}
