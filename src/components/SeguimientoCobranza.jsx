import React, { useState, useMemo, Fragment } from 'react';
import Sidebar from './Sidebar'; 
import Navbar from './Navbar'; 
import { 
  FiSearch, FiPlus, FiEdit2, FiTrash2, FiMoreVertical, 
  FiDownload, FiFilter, FiChevronLeft, FiChevronRight, FiX, 
  FiAlertTriangle, FiFileText, FiUser, FiDollarSign, FiCalendar,
  FiEye, FiCopy, FiPrinter, FiArchive
} from 'react-icons/fi';
import { Menu, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import './css/SeguimientoCobranza.css';

const SeguimientoCobranza = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [hoverStatus, setHoverStatus] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  
  const [registros, setRegistros] = useState([
    { id: 1, poliza: '222-0000329846-04', cliente: 'Jorge Arollo', agente: 'Admin Principal', monto: 850.20, fecha_prog: '2024-03-20', estatus: 'Rojo' },
    { id: 2, poliza: '210-0000008293-14', cliente: 'Martha Celia', agente: 'Laura Méndez', monto: 150.35, fecha_prog: '2024-03-25', estatus: 'Verde' },
    { id: 3, poliza: '310-0000001293-14', cliente: 'Carlos Ruiz', agente: 'Roberto Solís', monto: 999.00, fecha_prog: '2024-03-22', estatus: 'Amarillo' },
    { id: 4, poliza: '410-0000002293-14', cliente: 'Laura Gomez', agente: 'María Fernández', monto: 450.50, fecha_prog: '2024-03-28', estatus: 'Verde' },
    { id: 5, poliza: '510-0000003293-14', cliente: 'Pedro Martinez', agente: 'Juan Pérez', monto: 1200.00, fecha_prog: '2024-03-30', estatus: 'Amarillo' },
    { id: 6, poliza: '610-0000004293-14', cliente: 'Ana Torres', agente: 'Juan Pérez', monto: 1200.00, fecha_prog: '2024-03-30', estatus: 'Amarillo' },
    { id: 7, poliza: '710-0000005293-14', cliente: 'Luis Fernandez', agente: 'Juan Pérez', monto: 1200.00, fecha_prog: '2024-03-30', estatus: 'Amarillo' },
    { id: 8, poliza: '810-0000006293-14', cliente: 'Sofia Lopez', agente: 'Juan Pérez', monto: 1200.00, fecha_prog: '2024-03-30', estatus: 'Amarillo' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [currentRegistro, setCurrentRegistro] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredRegistros = useMemo(() => {
    return registros.filter(reg => 
      reg.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.poliza.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.agente.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [registros, searchTerm]);

  const totalPages = Math.ceil(filteredRegistros.length / itemsPerPage);
  const paginatedRegistros = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRegistros.slice(start, start + itemsPerPage);
  }, [filteredRegistros, currentPage]);

  const handleOpenAdd = () => {
    setCurrentRegistro({ poliza: '', cliente: '', agente: '', monto: '', fecha_prog: '', estatus: 'Verde' });
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (e, registro) => {
    e.stopPropagation();
    setCurrentRegistro({...registro});
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleOpenDelete = (e, registro) => {
    e.stopPropagation();
    setCurrentRegistro(registro);
    setModalDeleteOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (isEditing) {
      setRegistros(registros.map(r => r.id === currentRegistro.id ? currentRegistro : r));
    } else {
      setRegistros([...registros, { ...currentRegistro, id: Date.now() }]);
    }
    setModalOpen(false);
    setCurrentRegistro(null);
  };

  const handleDelete = () => {
    setRegistros(registros.filter(r => r.id !== currentRegistro.id));
    setModalDeleteOpen(false);
    setCurrentRegistro(null);
  };

  const getStatusColor = (estatus) => {
    switch(estatus) {
      case 'Verde': return 'cobranza-status-verde';
      case 'Amarillo': return 'cobranza-status-amarillo';
      case 'Rojo': return 'cobranza-status-rojo';
      default: return '';
    }
  };

  return (
    <div className="cobranza-container">
      <Sidebar onExpand={setIsSidebarExpanded} />
      
      <div className={`cobranza-main-content ${isSidebarExpanded ? 'cobranza-sidebar-expanded' : 'cobranza-sidebar-collapsed'}`}>
        <Navbar />

        <main className="cobranza-main">
          <div className="cobranza-header">
            <div>
              <h1 className="cobranza-title">Seguimiento de Cobranza</h1>
              <p className="cobranza-subtitle">Gestión de agentes y fechas programadas</p>
            </div>
            <div className="cobranza-header-actions">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cobranza-btn-export"
              >
                <FiDownload size={18} /> Exportar
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOpenAdd}
                className="cobranza-btn-add"
              >
                <FiPlus size={18} /> Nuevo Registro
              </motion.button>
            </div>
          </div>

          <div className="cobranza-search-section">
            <div className="cobranza-search-wrapper">
              <FiSearch className="cobranza-search-icon" />
              <input 
                type="text" 
                placeholder="Buscar por póliza, cliente o agente..." 
                className="cobranza-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cobranza-btn-filter"
            >
              <FiFilter size={16} /> Filtros
            </motion.button>
          </div>

          {/* Tabla */}
          <div className="cobranza-table-container">
            <div className="cobranza-table-responsive">
              <table className="cobranza-table">
                <thead>
                  <tr>
                    <th>Póliza</th>
                    <th>Cliente</th>
                    <th>Agente</th>
                    <th>Fecha Prog.</th>
                    <th>Monto</th>
                    <th>Estatus</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRegistros.map((reg, index) => (
                    <motion.tr 
                      key={reg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="cobranza-table-row"
                    >
                      <td className="cobranza-cell-poliza">
                        <span className="cobranza-badge-poliza">{reg.poliza}</span>
                      </td>
                      <td className="cobranza-cell-cliente">
                        <span className="cobranza-cliente-nombre">{reg.cliente}</span>
                      </td>
                      <td className="cobranza-cell-agente">{reg.agente}</td>
                      <td className="cobranza-cell-fecha">
                        <div className="cobranza-fecha-wrapper">
                          <FiCalendar className="cobranza-fecha-icon" />
                          <span>{reg.fecha_prog}</span>
                        </div>
                      </td>
                      <td className="cobranza-cell-monto">
                        <span className="cobranza-monto">
                          ${reg.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="cobranza-cell-status">
                        <div 
                          className="cobranza-status-wrapper"
                          onMouseEnter={() => setHoverStatus(reg.id)}
                          onMouseLeave={() => setHoverStatus(null)}
                        >
                          <div className={`cobranza-status-dot ${getStatusColor(reg.estatus)}`} />
                          <span className={`cobranza-status-text ${getStatusColor(reg.estatus)}`}>
                            {reg.estatus}
                          </span>
                          
                          <AnimatePresence>
                            {hoverStatus === reg.id && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="cobranza-tooltip"
                              >
                                <div className="cobranza-tooltip-arrow" />
                                <p className="cobranza-tooltip-title">Guía de Seguimiento</p>
                                <div className="cobranza-tooltip-content">
                                  <p><span className="cobranza-tooltip-dot cobranza-dot-verde" /> Verde: Cobro exitoso</p>
                                  <p><span className="cobranza-tooltip-dot cobranza-dot-amarillo" /> Amarillo: En proceso / Promesa</p>
                                  <p><span className="cobranza-tooltip-dot cobranza-dot-rojo" /> Rojo: Urgente / Vencido</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                      <td className="cobranza-cell-actions">
                        <div className="cobranza-actions-group">
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => handleOpenEdit(e, reg)} 
                            className="cobranza-action-btn cobranza-edit-btn"
                            title="Editar"
                          >
                            <FiEdit2 />
                          </motion.button>
                          
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => handleOpenDelete(e, reg)} 
                            className="cobranza-action-btn cobranza-delete-btn"
                            title="Eliminar"
                          >
                            <FiTrash2 />
                          </motion.button>

                          {/* Menú de tres puntitos */}
                          <Menu as="div" className="cobranza-menu">
                            <Menu.Button as="div" className="cobranza-menu-button">
                              <FiMoreVertical />
                            </Menu.Button>
                            
                            <Transition
                              as={Fragment}
                              enter="cobranza-transition-enter"
                              enterFrom="cobranza-transition-enter-from"
                              enterTo="cobranza-transition-enter-to"
                              leave="cobranza-transition-leave"
                              leaveFrom="cobranza-transition-leave-from"
                              leaveTo="cobranza-transition-leave-to"
                            >
                              <Menu.Items className="cobranza-menu-items">
                                <Menu.Item>
                                  {({ active }) => (
                                    <button className={`cobranza-menu-item ${active ? 'cobranza-menu-item-active' : ''}`}>
                                      <FiEye /> Ver detalles
                                    </button>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button className={`cobranza-menu-item ${active ? 'cobranza-menu-item-active' : ''}`}>
                                      <FiCopy /> Duplicar
                                    </button>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button className={`cobranza-menu-item ${active ? 'cobranza-menu-item-active' : ''}`}>
                                      <FiPrinter /> Imprimir
                                    </button>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button className={`cobranza-menu-item ${active ? 'cobranza-menu-item-active' : ''}`}>
                                      <FiArchive /> Archivar
                                    </button>
                                  )}
                                </Menu.Item>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="cobranza-pagination">
              <div className="cobranza-pagination-info">
                Total: <span className="cobranza-pagination-highlight">{filteredRegistros.length}</span> trámites
              </div>
              <div className="cobranza-pagination-controls">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cobranza-pagination-btn cobranza-pagination-prev"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <FiChevronLeft />
                </motion.button>
                <span className="cobranza-pagination-page">
                  Página {currentPage} de {totalPages}
                </span>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cobranza-pagination-btn cobranza-pagination-next"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <FiChevronRight />
                </motion.button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Agregar/Editar */}
      <AnimatePresence>
        {modalOpen && currentRegistro && (
          <div className="cobranza-modal-overlay">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="cobranza-modal-panel cobranza-modal-form"
            >
              <div className="cobranza-modal-header">
                
                <h2 className="cobranza-modal-title">{isEditing ? 'Editar Seguimiento' : 'Nuevo Trámite'}</h2>
                <button onClick={() => setModalOpen(false)} className="cobranza-modal-close">
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSave} className="cobranza-modal-form">
                <div className="cobranza-form-grid">
                  <div className="cobranza-form-group cobranza-full-width">
                    <label>Cliente *</label>
                    <div className="cobranza-input-wrapper">
                      <FiUser className="cobranza-input-icon" />
                      <input 
                        type="text" 
                        value={currentRegistro.cliente || ''} 
                        onChange={e => setCurrentRegistro({...currentRegistro, cliente: e.target.value})}
                        placeholder="Nombre completo"
                        required
                      />
                    </div>
                  </div>

                  <div className="cobranza-form-group">
                    <label>Póliza *</label>
                    <div className="cobranza-input-wrapper">
                      <FiFileText className="cobranza-input-icon" />
                      <input 
                        type="text" 
                        value={currentRegistro.poliza || ''} 
                        onChange={e => setCurrentRegistro({...currentRegistro, poliza: e.target.value})}
                        placeholder="Número de póliza"
                        required
                      />
                    </div>
                  </div>

                  <div className="cobranza-form-group">
                    <label>Agente *</label>
                    <div className="cobranza-input-wrapper">
                      <FiUser className="cobranza-input-icon" />
                      <input 
                        type="text" 
                        value={currentRegistro.agente || ''} 
                        onChange={e => setCurrentRegistro({...currentRegistro, agente: e.target.value})}
                        placeholder="Nombre del agente"
                        required
                      />
                    </div>
                  </div>

                  <div className="cobranza-form-group">
                    <label>Monto *</label>
                    <div className="cobranza-input-wrapper">
                      <FiDollarSign className="cobranza-input-icon" />
                      <input 
                        type="number" 
                        step="0.01"
                        value={currentRegistro.monto || ''} 
                        onChange={e => setCurrentRegistro({...currentRegistro, monto: parseFloat(e.target.value)})}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div className="cobranza-form-group">
                    <label>Fecha Programada *</label>
                    <div className="cobranza-input-wrapper">
                      <FiCalendar className="cobranza-input-icon" />
                      <input 
                        type="date" 
                        value={currentRegistro.fecha_prog || ''} 
                        onChange={e => setCurrentRegistro({...currentRegistro, fecha_prog: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="cobranza-form-group cobranza-full-width">
                    <label>Estatus *</label>
                    <select 
                      value={currentRegistro.estatus || 'Verde'} 
                      onChange={e => setCurrentRegistro({...currentRegistro, estatus: e.target.value})}
                      className="cobranza-select"
                    >
                      <option value="Verde">Verde - Sin Pendientes</option>
                      <option value="Amarillo">Amarillo - En proceso / Promesa</option>
                      <option value="Rojo">Rojo - Urgente / Vencido</option>
                    </select>
                  </div>
                </div>

                <div className="cobranza-modal-actions">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="cobranza-btn-cancel"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="cobranza-btn-save"
                  >
                    Guardar Cambios
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Eliminar */}
      <AnimatePresence>
        {modalDeleteOpen && currentRegistro && (
          <div className="cobranza-modal-overlay cobranza-modal-overlay-delete">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="cobranza-modal-panel cobranza-modal-delete"
            >
              <div className="cobranza-delete-icon">
                <FiAlertTriangle />
              </div>
              <h3 className="cobranza-delete-title">¿Eliminar registro?</h3>
              <p className="cobranza-delete-text">
                Vas a eliminar el seguimiento de la póliza <strong>{currentRegistro.poliza}</strong> de <strong>{currentRegistro.cliente}</strong>. Esta acción no se puede deshacer.
              </p>
              <div className="cobranza-delete-actions">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDelete}
                  className="cobranza-delete-confirm"
                >
                  Eliminar Ahora
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setModalDeleteOpen(false)}
                  className="cobranza-delete-cancel"
                >
                  Cancelar
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SeguimientoCobranza;