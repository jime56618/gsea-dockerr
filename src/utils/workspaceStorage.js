/**
 * Guarda workspace activo en localStorage a partir del user del API (login, /user, etc.).
 */
export function persistWorkspaceFromUser(user) {
  if (!user || typeof user !== 'object') return;
  const wid =
    user.current_workspace_id ??
    user.workspace_id ??
    user.workspace?.id ??
    (Array.isArray(user.workspaces) ? user.workspaces[0]?.id : null);
  if (wid != null) {
    localStorage.setItem('current_workspace_id', String(wid));
  }
  if (user.current_workspace && typeof user.current_workspace === 'object') {
    localStorage.setItem('workspace_activo', JSON.stringify(user.current_workspace));
  } else if (wid != null && !localStorage.getItem('workspace_activo')) {
    localStorage.setItem('workspace_activo', JSON.stringify({ id: wid }));
  }
}
