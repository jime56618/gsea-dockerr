import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus, FileText, Edit2, Trash2, Search,
  UploadCloud, X, ChevronLeft, ChevronRight,
  AlertCircle, Filter,
  MoreVertical, Eye, Download, Copy
} from 'lucide-react';

// Importación de tus componentes de navegación
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import './css/SeguimientoPolizas.css';

const INITIAL_POLIZAS = [
  { id: 1, numero: '222-000329846-04', aseguradora: 'AXA Seguros', contratante: 'Jorge Arollo', vigencia: '2025-12-30', estatus: 'Vigente' },
  { id: 2, numero: '210-0000008293-14', aseguradora: 'GNP', contratante: 'Martha Celia', vigencia: '2024-01-15', estatus: 'No Vigente' },
  { id: 3, numero: '310-0000001293-14', aseguradora: 'Qualitas', contratante: 'Carlos Ruiz', vigencia: '2026-05-22', estatus: 'Vigente' },
  { id: 4, numero: '410-0000002293-14', aseguradora: 'BBVA', contratante: 'Laura Gómez', vigencia: '2024-11-10', estatus: 'Vigente' },
  { id: 5, numero: '510-0000003293-14', aseguradora: 'Santander', contratante: 'Pedro Martínez', vigencia: '2023-12-05', estatus: 'No Vigente' },
  { id: 6, numero: '610-0000004293-14', aseguradora: 'Qualitas', contratante: 'Ana Torres', vigencia: '2024-08-15', estatus: 'Vigente' },
];

const MENU_W = 180;
const MENU_H = 140;
const MENU_GAP = 8;
const SAFE_PADDING = 12;

const SeguimientoPolizas = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [polizas, setPolizas] = useState(INITIAL_POLIZAS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstatus, setFilterEstatus] = useState('Todos');
  const [modalType, setModalType] = useState(null);
  const [selectedPoliza, setSelectedPoliza] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  const itemsPerPage = 5;

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lógica de Filtros
  const filteredPolizas = useMemo(() => {
    return polizas.filter(p => {
      const matchesSearch =
        p.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contratante.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.aseguradora.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterEstatus === 'Todos' || p.estatus === filterEstatus;
      return matchesSearch && matchesFilter;
    });
  }, [polizas, searchTerm, filterEstatus]);

  const totalPages = Math.ceil(filteredPolizas.length / itemsPerPage) || 1;

  const paginatedPolizas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPolizas.slice(start, start + itemsPerPage);
  }, [filteredPolizas, currentPage]);

  // Evitar que currentPage quede fuera si cambia el filtro/busqueda
  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages));
  }, [totalPages]);

  const getStatusConfig = (estatus) => {
    return estatus === 'Vigente'
      ? {
        class: 'polizas-status-vigente',
        dot: 'polizas-dot-vigente',
        label: 'Vigente'
      }
      : {
        class: 'polizas-status-no-vigente',
        dot: 'polizas-dot-no-vigente',
        label: 'No Vigente'
      };
  };

  // ✅ Menú flotante: posición mejor (sin -140 hardcode)
  const handleMenuClick = (e, polizaId) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();

    setMenuPosition({
      top: rect.bottom + MENU_GAP,
      left: rect.right - MENU_W,
    });

    setActiveMenuId((prev) => (prev === polizaId ? null : polizaId));
  };

  return (
    <div className="polizas-container">
      <Sidebar onExpand={setIsSidebarExpanded} />

      <div className={`polizas-main-content ${isSidebarExpanded ? 'polizas-sidebar-expanded' : 'polizas-sidebar-collapsed'}`}>
        <Navbar />

        <main className="polizas-main">
          {/* Header */}
          <div className="polizas-header">
            <div className="polizas-header-left">
              <h1 className="polizas-title">Seguimiento de Pólizas</h1>
              <p className="polizas-subtitle">Gestiona y consulta la vigencia de tus documentos</p>
            </div>

            <div className="polizas-header-actions">
              <button
                onClick={() => setModalType('add')}
                className="polizas-btn-add"
              >
                <Plus size={18} />
                <span>Agregar Póliza</span>
              </button>
              <button
                onClick={() => setModalType('upload')}
                className="polizas-btn-upload"
              >
                <UploadCloud size={18} />
                <span>Subir Documento</span>
              </button>
            </div>
          </div>

          {/* Buscador y Filtros */}
          <div className="polizas-search-section">
            <div className="polizas-search-wrapper">
              <Search className="polizas-search-icon" size={18} />
              <input
                type="text"
                placeholder="Buscar por número, contratante o aseguradora..."
                className="polizas-search-input"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="polizas-filter-wrapper">
              <label className="polizas-filter-label">
                <Filter size={16} />
                <span>Filtrar por:</span>
              </label>
              <select
                className="polizas-filter-select-visible"
                onChange={(e) => {
                  setFilterEstatus(e.target.value);
                  setCurrentPage(1);
                }}
                value={filterEstatus}
              >
                <option value="Todos">Todos los estados</option>
                <option value="Vigente">Vigente</option>
                <option value="No Vigente">No Vigente</option>
              </select>
            </div>
          </div>

          {/* Tabla */}
          <div className="polizas-table-container">
            <div className="polizas-table-wrapper">
              <table className="polizas-table">
                <thead>
                  <tr>
                    <th>Número de Póliza</th>
                    <th>Aseguradora</th>
                    <th>Contratante</th>
                    <th className="text-center">Archivo</th>
                    <th>Vigencia</th>
                    <th>Estatus</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPolizas.map((poliza, index) => {
                    const statusConfig = getStatusConfig(poliza.estatus);
                    return (
                      <tr
                        key={poliza.id}
                        className="polizas-row"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="polizas-cell polizas-cell-numero">
                          <span className="polizas-badge">{poliza.numero}</span>
                        </td>
                        <td className="polizas-cell polizas-cell-aseguradora">
                          <span className="polizas-aseguradora">{poliza.aseguradora}</span>
                        </td>
                        <td className="polizas-cell polizas-cell-contratante">
                          <span className="polizas-contratante">{poliza.contratante}</span>
                        </td>
                        <td className="polizas-cell polizas-cell-file text-center">
                          <button className="polizas-file-btn">
                            <FileText size={16} />
                          </button>
                        </td>
                        <td className="polizas-cell polizas-cell-vigencia">
                          <div className="polizas-vigencia">
                            <span>{new Date(poliza.vigencia).toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                          </div>
                        </td>
                        <td className="polizas-cell polizas-cell-status">
                          <div className={`polizas-status ${statusConfig.class}`}>
                            <span className={`polizas-status-dot ${statusConfig.dot}`} />
                            <span className="polizas-status-label">{statusConfig.label}</span>
                          </div>
                        </td>
                        <td className="polizas-cell polizas-cell-actions">
                          <div className="polizas-actions">
                            <button
                              onClick={() => { setSelectedPoliza(poliza); setModalType('edit'); }}
                              className="polizas-action polizas-action-edit"
                              title="Editar"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => { setSelectedPoliza(poliza); setModalType('delete'); }}
                              className="polizas-action polizas-action-delete"
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>

                            {/* Botón de menú flotante */}
                            <button
                              className="polizas-menu-button"
                              onClick={(e) => handleMenuClick(e, poliza.id)}
                              title="Más opciones"
                            >
                              <MoreVertical size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ✅ Paginación NUEVA: [Prev]  Página X de Y  [Next] */}
           <div className="polizas-pagination polizas-pagination-new">
             <div className="polizas-pagination-info">
               Mostrando <span className="polizas-pagination-highlight">{paginatedPolizas.length}</span> de{' '}
               <span className="polizas-pagination-highlight">{filteredPolizas.length}</span> registros
             </div>
           
             <div className="polizas-pagination-right polizas-pagination-right-inline">
               {/* Prev */}
               <button
                 className="polizas-pagination-arrowSolo"
                 onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                 disabled={currentPage === 1}
                 aria-label="Página anterior"
                 title="Anterior"
               >
                 <ChevronLeft size={16} />
               </button>
           
               {/* Label */}
               <span className="polizas-pagination-pageLabel polizas-pagination-pageLabel-inline">
                 Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
               </span>
           
               {/* Next */}
               <button
                 className="polizas-pagination-arrowSolo"
                 onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                 disabled={currentPage === totalPages || filteredPolizas.length === 0}
                 aria-label="Página siguiente"
                 title="Siguiente"
               >
                 <ChevronRight size={16} />
               </button>
             </div>
           </div>
          </div>
        </main>
      </div>

      {/* ✅ Menú flotante en PORTAL (siempre arriba, no se recorta en tabla) */}
      {activeMenuId && createPortal(
        <FloatingMenu
          refEl={menuRef}
          top={menuPosition.top}
          left={menuPosition.left}
          onClose={() => setActiveMenuId(null)}
        />,
        document.body
      )}

      {/* Modal Manager */}
      {modalType && (
        <ModalManager
          type={modalType}
          data={selectedPoliza}
          onClose={() => setModalType(null)}
          onConfirm={(newData) => {
            if (modalType === 'add') setPolizas([...polizas, { ...newData, id: Date.now() }]);
            if (modalType === 'edit') setPolizas(polizas.map(p => p.id === selectedPoliza.id ? newData : p));
            if (modalType === 'delete') setPolizas(polizas.filter(p => p.id !== selectedPoliza.id));
            setModalType(null);
            setActiveMenuId(null);
          }}
        />
      )}
    </div>
  );
};

// ✅ Menú flotante Portal
const FloatingMenu = ({ refEl, top, left, onClose }) => {
  const maxLeft = window.innerWidth - MENU_W - SAFE_PADDING;
  const maxTop = window.innerHeight - MENU_H - SAFE_PADDING;

  const safeLeft = Math.max(SAFE_PADDING, Math.min(left, maxLeft));
  const safeTop = Math.max(SAFE_PADDING, Math.min(top, maxTop));

  return (
    <div
      ref={refEl}
      className="polizas-floating-menu polizas-floating-menu-portal"
      style={{
        position: 'fixed',
        top: safeTop,
        left: safeLeft,
        zIndex: 99999,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="polizas-floating-menu-items">
        <button className="polizas-floating-menu-item" onClick={onClose}>
          <Eye size={14} /> Ver detalles
        </button>
        <button className="polizas-floating-menu-item" onClick={onClose}>
          <Download size={14} /> Descargar
        </button>
        <button className="polizas-floating-menu-item" onClick={onClose}>
          <Copy size={14} /> Duplicar
        </button>
      </div>
    </div>
  );
};

// Modal Manager
const ModalManager = ({ type, data, onClose, onConfirm }) => {
  const [formData, setFormData] = useState(data || {
    numero: '',
    aseguradora: '',
    contratante: '',
    vigencia: new Date().toISOString().split('T')[0],
    estatus: 'Vigente'
  });

  const getModalIcon = () => {
    switch (type) {
      case 'add': return <Plus size={24} />;
      case 'edit': return <Edit2 size={24} />;
      case 'delete': return <Trash2 size={24} />;
      case 'upload': return <UploadCloud size={24} />;
      default: return null;
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case 'add': return 'Nueva Póliza';
      case 'edit': return 'Editar Póliza';
      case 'delete': return 'Confirmar Eliminación';
      case 'upload': return 'Subir Documento';
      default: return '';
    }
  };

  return (
    <div className="polizas-modal-overlay ">
      <div className={`polizas-modal  ${type === 'delete' ? 'polizas-modal-delete' : ''}`}>
        <div className="polizas-modal-header">
          
          <h3 className="polizas-modal-title">{getModalTitle()}</h3>
          <button onClick={onClose} className="polizas-modal-close">
            <X size={20} />
          </button>
        </div>

        <div className="polizas-modal-content">
          {type === 'delete' ? (
            <div className="polizas-delete-content">
              <div className="polizas-delete-warning">
                <AlertCircle size={40} />
              </div>
              <p className="polizas-delete-text">
                ¿Estás seguro de eliminar la póliza <strong>{data?.numero}</strong>?
              </p>
              <p className="polizas-delete-subtext">Esta acción no se puede deshacer.</p>
              <div className="polizas-delete-actions">
                <button onClick={() => onConfirm()} className="polizas-btn-delete-confirm">
                  Eliminar
                </button>
                <button onClick={onClose} className="polizas-btn-delete-cancel">
                  Cancelar
                </button>
              </div>
            </div>
          ) : type === 'upload' ? (
            <div className="polizas-upload-content">
              <div className="polizas-upload-area">
                <UploadCloud size={40} className="polizas-upload-icon" />
                <p className="polizas-upload-text">Arrastra tu archivo PDF aquí</p>
                <p className="polizas-upload-hint">o haz clic para seleccionar</p>
                <input type="file" accept=".pdf" className="polizas-upload-input" />
              </div>
              <button onClick={onClose} className="polizas-btn-upload-confirm">
                Escanear Documento
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); onConfirm(formData); }} className="polizas-form">
              <div className="polizas-form-group">
                <label>Número de Póliza</label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="Ej: 123-456789-01"
                  required
                />
              </div>

              <div className="polizas-form-group">
                <label>Aseguradora</label>
                <input
                  type="text"
                  value={formData.aseguradora}
                  onChange={(e) => setFormData({ ...formData, aseguradora: e.target.value })}
                  placeholder="Ej: AXA, GNP, etc."
                  required
                />
              </div>

              <div className="polizas-form-group">
                <label>Contratante</label>
                <input
                  type="text"
                  value={formData.contratante}
                  onChange={(e) => setFormData({ ...formData, contratante: e.target.value })}
                  placeholder="Nombre completo"
                  required
                />
              </div>

              <div className="polizas-form-row">
                <div className="polizas-form-group">
                  <label>Vigencia</label>
                  <input
                    type="date"
                    value={formData.vigencia}
                    onChange={(e) => setFormData({ ...formData, vigencia: e.target.value })}
                    required
                  />
                </div>

                <div className="polizas-form-group">
                  <label>Estatus</label>
                  <select
                    value={formData.estatus}
                    onChange={(e) => setFormData({ ...formData, estatus: e.target.value })}
                  >
                    <option value="Vigente">Vigente</option>
                    <option value="No Vigente">No Vigente</option>
                  </select>
                </div>
              </div>

              <div className="polizas-form-actions">
                <button type="button" onClick={onClose} className="polizas-btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="polizas-btn-submit">
                  {type === 'add' ? 'Guardar Póliza' : 'Actualizar Datos'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeguimientoPolizas;