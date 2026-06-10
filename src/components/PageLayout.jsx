import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './css/PageLayout.css';

/**
 * Layout estándar GSEA: sidebar izquierdo + navbar + contenido.
 * Misma estructura que Dashboard / Agentes / Clientes.
 */
export default function PageLayout({ children }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <div className="gsea-layout">
      <Sidebar onExpand={setIsSidebarExpanded} />
      <div
        className={`gsea-layout-main ${
          isSidebarExpanded ? 'gsea-layout-main--expanded' : 'gsea-layout-main--collapsed'
        }`}
      >
        <Navbar />
        <main className="gsea-layout-content">{children}</main>
      </div>
    </div>
  );
}

export function ConfigPageHeader({ icon: Icon, title, subtitle, actions }) {
  return (
    <header className="gsea-config-header">
      <div className="gsea-config-header__left">
        {Icon && (
          <div className="gsea-config-header__icon">
            <Icon size={28} strokeWidth={2} />
          </div>
        )}
        <div>
          <h1 className="gsea-config-header__title">{title}</h1>
          {subtitle && <p className="gsea-config-header__sub">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="gsea-config-header__actions">{actions}</div>}
    </header>
  );
}
