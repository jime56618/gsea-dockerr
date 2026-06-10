import React, { useCallback, useEffect, useState } from 'react';
import { Shield, Plus, Save, Lock } from 'lucide-react';
import PageLayout, { ConfigPageHeader } from './PageLayout';
import { apiFetch, ApiError } from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';
import { getActiveWorkspaceId } from '../utils/workspaceStorage';
import './css/SaaS.css';

export default function RolesEditor() {
  const { can, currentWorkspace } = useAuth();
  const workspaceId = getActiveWorkspaceId();
  const [roles, setRoles] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const [rolesRes, permRes] = await Promise.all([
        apiFetch(`/workspaces/${workspaceId}/roles`),
        apiFetch('/permissions'),
      ]);
      setRoles(rolesRes.data || []);
      setCatalog(permRes.permissions || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  const selectRole = (role) => {
    setSelectedRole(role);
    setSelectedPerms((role.permissions || []).map((p) => p.name));
    setMsg('');
    setError('');
  };

  const togglePerm = (name) => {
    setSelectedPerms((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const isAdminReadOnly = selectedRole?.is_system && selectedRole?.slug === 'admin';

  const savePermissions = async () => {
    if (!selectedRole || isAdminReadOnly) {
      setError('No se puede editar el rol Administrador.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await apiFetch(`/roles/${selectedRole.id}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissions: selectedPerms }),
      });
      setMsg('Permisos guardados correctamente.');
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const createRole = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    setError('');
    try {
      await apiFetch(`/workspaces/${workspaceId}/roles`, {
        method: 'POST',
        body: JSON.stringify({ nombre: newName.trim(), permissions: [] }),
      });
      setNewName('');
      await load();
      setMsg('Rol creado.');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!can('roles.manage')) {
    return (
      <PageLayout>
        <div className="gsea-config-empty">
          <Shield size={40} className="gsea-config-empty__icon" />
          <p>No tienes permiso para gestionar roles.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <ConfigPageHeader
        icon={Shield}
        title="Roles y permisos"
        subtitle={`Define qué puede hacer cada rol en ${currentWorkspace?.nombre || 'tu promotoría'}.`}
      />

      <div className="gsea-card gsea-card--section">
        <h2 className="gsea-card__title">
          <Plus size={18} /> Nuevo rol personalizado
        </h2>
        <form onSubmit={createRole} className="gsea-form-row">
          <input
            className="gsea-input"
            style={{ marginBottom: 0, flex: 1 }}
            placeholder="Ej. Supervisor de ventas"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="submit" className="gsea-btn-primary" disabled={saving}>
            Crear rol
          </button>
        </form>
      </div>

      <div className="gsea-roles-layout">
        <div className="gsea-card gsea-card--section gsea-roles-list">
          <h2 className="gsea-card__title">Roles</h2>
          {loading ? (
            <p className="gsea-config-loading">Cargando…</p>
          ) : (
            <ul className="gsea-role-list">
              {roles.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className={`gsea-role-item ${selectedRole?.id === r.id ? 'gsea-role-item--active' : ''}`}
                    onClick={() => selectRole(r)}
                  >
                    <span className="gsea-role-item__name">{r.nombre}</span>
                    {r.is_system && <span className="gsea-role-item__tag">sistema</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="gsea-card gsea-card--section gsea-roles-panel">
          {selectedRole ? (
            <>
              <div className="gsea-roles-panel__head">
                <h2 className="gsea-card__title">Permisos: {selectedRole.nombre}</h2>
                {isAdminReadOnly && (
                  <span className="gsea-badge gsea-badge--muted">
                    <Lock size={12} /> Solo lectura
                  </span>
                )}
              </div>
              <div className="gsea-perm-grid">
                {catalog.map((p) => (
                  <label key={p.name} className="gsea-perm-item">
                    <input
                      type="checkbox"
                      checked={selectedPerms.includes(p.name)}
                      disabled={isAdminReadOnly}
                      onChange={() => togglePerm(p.name)}
                    />
                    <span>
                      <strong>{p.name}</strong>
                      <span className="gsea-perm-desc">{p.description}</span>
                    </span>
                  </label>
                ))}
              </div>
              {error && <p className="gsea-msg gsea-msg--error">{error}</p>}
              {msg && <p className="gsea-msg gsea-msg--ok">{msg}</p>}
              {!isAdminReadOnly && (
                <button
                  type="button"
                  className="gsea-btn-primary gsea-btn-primary--lg"
                  disabled={saving}
                  onClick={savePermissions}
                >
                  <Save size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
                  {saving ? 'Guardando…' : 'Guardar permisos'}
                </button>
              )}
            </>
          ) : (
            <div className="gsea-config-empty gsea-config-empty--inline">
              <Shield size={32} className="gsea-config-empty__icon" />
              <p>Selecciona un rol de la lista para editar sus permisos.</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
