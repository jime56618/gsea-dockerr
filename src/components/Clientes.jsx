import React, { useState, useMemo, Fragment } from 'react';
import Sidebar from './Sidebar'; 
import Navbar from './Navbar';   
import { 
  FiUser, FiMail, FiPhone, FiFileText, FiEdit2, FiTrash2, 
  FiSearch, FiPlus, FiAlertCircle, FiX, FiDownloadCloud, 
  FiChevronLeft, FiChevronRight, FiFilter, FiMapPin,
  FiCalendar, FiUserCheck, FiSmartphone, FiMessageCircle,
  FiDollarSign, FiBriefcase, FiGlobe, FiMoreVertical,
  FiEye, FiCopy, FiPrinter, FiArchive, FiShare2
} from 'react-icons/fi';
import { Menu, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import './css/Clientes.css';

const initialClients = [
  { id: 1, nombre: 'Roy G Bhiv', rfc: 'BHGR900101HDF', telefono: '(225) 555-0118', whatsapp: '+5212255550118', correo: 'roy.b@email.com', estatus: 'Activo', vendedor: 'María Fernández', direccion: 'Av. Reforma 123, CDMX', fechaAlta: '2024-01-15', capturo: 'Admin', curp: 'BHGR900101HDF123', tipoPersona: 'Física', folioCliente: 'CLI-001' },
  { id: 2, nombre: 'Mason Stefi', rfc: 'STMA850505MDF', telefono: '(205) 555-0100', whatsapp: '+5212055550100', correo: 'stefi.m@email.com', estatus: 'Inactivo', vendedor: 'Juan Pérez', direccion: 'Calle 50 x 31, Mérida', fechaAlta: '2023-11-20', capturo: 'Admin', curp: 'STMA850505MDF123', tipoPersona: 'Moral', folioCliente: 'CLI-002' },
  { id: 3, nombre: 'Uday Gupta', rfc: 'GUUP921010HDF', telefono: '(302) 555-0107', whatsapp: '+5213025550107', correo: 'uday.g@email.com', estatus: 'Nuevo', vendedor: 'María Fernández', direccion: 'Privada San Angel, Monterrey', fechaAlta: '2024-02-28', capturo: 'Admin', curp: 'GUUP921010HDF123', tipoPersona: 'Física', folioCliente: 'CLI-003' },
  { id: 4, nombre: 'Jason Smith', rfc: 'SMJA780808HDF', telefono: '(252) 555-0126', whatsapp: '+5212525550126', correo: 'jason.s@email.com', estatus: 'Activo', vendedor: 'María Fernández', direccion: 'Blvd. Kukulcan, Cancún', fechaAlta: '2024-01-05', capturo: 'Admin', curp: 'SMJA780808HDF123', tipoPersona: 'Física', folioCliente: 'CLI-004' },
  { id: 5, nombre: 'Emily Davis', rfc: 'DAEM950303MDF', telefono: '(212) 555-0198', whatsapp: '+5212125550198', correo: 'emily.d@email.com', estatus: 'Activo', vendedor: 'Pedro Gómez', direccion: 'Calle 60, Puebla', fechaAlta: '2023-11-20', capturo: 'Admin', curp: 'DAEM950303MDF123', tipoPersona: 'Física', folioCliente: 'CLI-005' },
  { id: 6, nombre: 'Michael Brown', rfc: 'BRMI880707HDF', telefono: '(215) 555-0145', whatsapp: '+5212155550145', correo: 'michael.b@email.com', estatus: 'Activo', vendedor: 'Juan Pérez', direccion: 'Av. Juárez, Guadalajara', fechaAlta: '2024-02-10', capturo: 'Admin', curp: 'BRMI880707HDF123', tipoPersona: 'Moral', folioCliente: 'CLI-006' },
  { id: 7, nombre: 'John Doe', rfc: 'DOJO880808HDF', telefono: '(212) 555-0198', whatsapp: '+5212125550198', correo: 'john.d@email.com', estatus: 'Activo', vendedor: 'María Fernández', direccion: 'Calle 5, Querétaro', fechaAlta: '2024-01-25', capturo: 'Admin', curp: 'DOJO880808HDF123', tipoPersona: 'Física', folioCliente: 'CLI-007' },
];

const vendedores = ['María Fernández', 'Juan Pérez', 'Pedro Gómez'];

const Clientes = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [clients] = useState(initialClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVendedor, setFilterVendedor] = useState('');
  const [filterTipoPersona, setFilterTipoPersona] = useState('');
  const [filterFechaInicio, setFilterFechaInicio] = useState('');
  const [filterFechaFin, setFilterFechaFin] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 5;

  const [modalState, setModalState] = useState({ type: null, data: null });
  const openModal = (type, data = null) => setModalState({ type, data });
  const closeModal = () => setModalState({ type: null, data: null });

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = searchTerm === '' || 
        client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        client.rfc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.telefono.includes(searchTerm);
      
      const matchesStatus = filterStatus === '' || client.estatus === filterStatus;
      const matchesVendedor = filterVendedor === '' || client.vendedor === filterVendedor;
      const matchesTipoPersona = filterTipoPersona === '' || client.tipoPersona === filterTipoPersona;
      
      const matchesFecha = (!filterFechaInicio || new Date(client.fechaAlta) >= new Date(filterFechaInicio)) &&
                          (!filterFechaFin || new Date(client.fechaAlta) <= new Date(filterFechaFin));
      
      return matchesSearch && matchesStatus && matchesVendedor && matchesTipoPersona && matchesFecha;
    });
  }, [clients, searchTerm, filterStatus, filterVendedor, filterTipoPersona, filterFechaInicio, filterFechaFin]);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(start, start + itemsPerPage);
  }, [filteredClients, currentPage]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Activo': return { color: 'clientes-bg-green-500', text: 'Activo', badge: 'clientes-status-active' };
      case 'Inactivo': return { color: 'clientes-bg-red-500', text: 'Inactivo', badge: 'clientes-status-inactive' };
      case 'Nuevo': return { color: 'clientes-bg-blue-500', text: 'Nuevo', badge: 'clientes-status-new' };
      default: return { color: 'clientes-bg-gray-300', text: '', badge: '' };
    }
  };

  return (
    <div className="clientes-container">
      <Sidebar onExpand={setIsSidebarExpanded} />
      
      <div className={`clientes-main-content ${isSidebarExpanded ? 'clientes-sidebar-expanded' : 'clientes-sidebar-collapsed'}`}>
        <Navbar />

        <main className="clientes-main">
          <div className="clientes-page-header">
            <div>
              <h1 className="clientes-page-title">Cartera de Clientes</h1>
              <p className="clientes-page-subtitle">Gestiona y administra tus clientes</p>
            </div>
            <div className="clientes-header-actions">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openModal('documento')} 
                className="clientes-btn-documento"
              >
                <FiDownloadCloud /> 
                <span>Documento</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openModal('agregar')} 
                className="clientes-btn-agregar"
              >
                <FiPlus /> 
                <span>Nuevo Cliente</span>
              </motion.button>
            </div>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="clientes-filters-section">
            <div className="clientes-search-wrapper">
              <FiSearch className="clientes-search-icon" />
              <input 
                type="text" 
                placeholder="Buscar por nombre, RFC, email o teléfono..." 
                className="clientes-search-input"
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`clientes-filters-toggle ${showFilters ? 'clientes-active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter />
              <span>Filtros</span>
            </motion.button>
          </div>

          {/* Filtros expandibles */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="clientes-filters-grid"
              >
                <div className="clientes-filter-card">
                  <h4 className="clientes-filter-title">Estado</h4>
                  <select className="clientes-filter-select" onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Nuevo">Nuevo</option>
                  </select>
                </div>

                <div className="clientes-filter-card">
                  <h4 className="clientes-filter-title">Vendedor</h4>
                  <select className="clientes-filter-select" onChange={(e) => setFilterVendedor(e.target.value)}>
                    <option value="">Todos los vendedores</option>
                    {vendedores.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                <div className="clientes-filter-card">
                  <h4 className="clientes-filter-title">Tipo de Persona</h4>
                  <select className="clientes-filter-select" onChange={(e) => setFilterTipoPersona(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="Física">Física</option>
                    <option value="Moral">Moral</option>
                  </select>
                </div>

                <div className="clientes-filter-card">
                  <h4 className="clientes-filter-title">Fecha de Alta</h4>
                  <div className="clientes-date-range">
                    <input 
                      type="date" 
                      className="clientes-date-input" 
                      placeholder="Desde"
                      onChange={(e) => setFilterFechaInicio(e.target.value)}
                    />
                    <span className="clientes-date-separator">-</span>
                    <input 
                      type="date" 
                      className="clientes-date-input" 
                      placeholder="Hasta"
                      onChange={(e) => setFilterFechaFin(e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabla de clientes */}
          <div className="clientes-table-container">
            <div className="clientes-table-responsive">
              <table className="clientes-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>RFC</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>WhatsApp</th>
                    <th>Estatus</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((client, index) => {
                    const statusConfig = getStatusConfig(client.estatus);
                    return (
                      <motion.tr 
                        key={client.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="clientes-table-row"
                      >
                        <td className="clientes-client-cell">
                          <button 
                            onClick={() => openModal('perfil', client)} 
                            className="clientes-client-name"
                          >
                            <div className="clientes-client-avatar">
                              {client.nombre.charAt(0)}
                            </div>
                            <div className="clientes-client-info">
                              <span className="clientes-client-fullname">{client.nombre}</span>
                              <span className="clientes-client-folio">{client.folioCliente}</span>
                            </div>
                          </button>
                        </td>
                        <td className="clientes-rfc-cell">{client.rfc}</td>
                        <td className="clientes-email-cell">
                          <div className="clientes-email-wrapper">
                            <FiMail className="clientes-email-icon" />
                            <span>{client.correo}</span>
                          </div>
                        </td>
                        <td className="clientes-phone-cell">
                          <div className="clientes-phone-wrapper">
                            <FiPhone className="clientes-phone-icon" />
                            <span>{client.telefono}</span>
                          </div>
                        </td>
                        <td className="clientes-whatsapp-cell">
                          <a 
                            href={`https://wa.me/${client.whatsapp?.replace('+', '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="clientes-whatsapp-link"
                          >
                            <FiSmartphone className="clientes-whatsapp-icon" />
                            <span>{client.whatsapp}</span>
                          </a>
                        </td>
                        <td className="clientes-status-cell">
                          <div className={`clientes-status-badge ${statusConfig.badge}`}>
                            <div className={`clientes-status-dot ${statusConfig.color}`} />
                            <span>{client.estatus}</span>
                          </div>
                        </td>
                        <td className="clientes-actions-cell">
                          <div className="clientes-actions-group">
                            {/* Botones de acción principales - más notorios */}
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal('editar', client)} 
                              className="clientes-action-btn clientes-edit-btn"
                              title="Editar cliente"
                            >
                              <FiEdit2 />
                            </motion.button>
                            
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openModal('eliminar', client)} 
                              className="clientes-action-btn clientes-delete-btn"
                              title="Eliminar cliente"
                            >
                              <FiTrash2 />
                            </motion.button>

                            {/* Menú de tres puntitos */}
                            <Menu as="div" className="clientes-actions-menu">
                              <Menu.Button as="div" className="clientes-actions-menu-button" title="Más opciones">
                                <FiMoreVertical size={18} />
                              </Menu.Button>
                              
                              <Transition
                                as={Fragment}
                                enter="clientes-transition-enter"
                                enterFrom="clientes-transition-enter-from"
                                enterTo="clientes-transition-enter-to"
                                leave="clientes-transition-leave"
                                leaveFrom="clientes-transition-leave-from"
                                leaveTo="clientes-transition-leave-to"
                              >
                                <Menu.Items className="clientes-menu-items">
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        className={`clientes-menu-item ${active ? 'clientes-menu-item-active' : ''}`}
                                      >
                                        <FiEye size={14} />
                                        <span>Ver detalles</span>
                                      </button>
                                    )}
                                  </Menu.Item>
                                  
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        className={`clientes-menu-item ${active ? 'clientes-menu-item-active' : ''}`}
                                      >
                                        <FiCopy size={14} />
                                        <span>Duplicar</span>
                                      </button>
                                    )}
                                  </Menu.Item>
                                  
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        className={`clientes-menu-item ${active ? 'clientes-menu-item-active' : ''}`}
                                      >
                                        <FiPrinter size={14} />
                                        <span>Imprimir</span>
                                      </button>
                                    )}
                                  </Menu.Item>
                                  
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        className={`clientes-menu-item ${active ? 'clientes-menu-item-active' : ''}`}
                                      >
                                        <FiArchive size={14} />
                                        <span>Archivar</span>
                                      </button>
                                    )}
                                  </Menu.Item>
                                  
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        className={`clientes-menu-item ${active ? 'clientes-menu-item-active' : ''}`}
                                      >
                                        <FiShare2 size={14} />
                                        <span>Compartir</span>
                                      </button>
                                    )}
                                  </Menu.Item>
                                </Menu.Items>
                              </Transition>
                            </Menu>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="clientes-pagination-wrapper">
              <div className="clientes-pagination-info">
                Mostrando <span className="clientes-pagination-highlight">{currentItems.length}</span> de{' '}
                <span className="clientes-pagination-highlight">{filteredClients.length}</span> registros
              </div>
              
              <div className="clientes-pagination-controls">
                <div className="clientes-pagination-pages">
                  <span className="clientes-pagination-current">Página {currentPage}</span>
                  <span className="clientes-pagination-total">de {totalPages}</span>
                </div>
                
                <div className="clientes-pagination-buttons">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(prev => prev - 1)} 
                    className="clientes-pagination-prev"
                  >
                    <FiChevronLeft />
                  </motion.button>
                  
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={currentPage === totalPages} 
                    onClick={() => setCurrentPage(prev => prev + 1)} 
                    className="clientes-pagination-next"
                  >
                    <FiChevronRight />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

   
   
     <AnimatePresence>
       {modalState.type && (
         <>
           {modalState.type === 'eliminar' ? (
             <div className="clientes-modal-overlay clientes-modal-overlay-delete">
               <AlertaEliminar onClose={closeModal} data={modalState.data} />
             </div>
           ) : (
             <div className="clientes-modal-overlay">
               {modalState.type === 'agregar' && <FormularioCliente onClose={closeModal} title="Nuevo Cliente" vendedores={vendedores} />}
               {modalState.type === 'editar' && <FormularioCliente onClose={closeModal} title="Editar Cliente" data={modalState.data} vendedores={vendedores} />}
               {modalState.type === 'perfil' && <PerfilDetallado onClose={closeModal} data={modalState.data} />}
               {modalState.type === 'documento' && <ModalDocumento onClose={closeModal} />}
             </div>
           )}
         </>
       )}
     </AnimatePresence>
    </div>
  );
};

// Componente de formulario
const FormularioCliente = ({ onClose, title, data, vendedores }) => {
  const [formData, setFormData] = useState(data || {
    nombre: '', rfc: '', curp: '', telefono: '', whatsapp: '', correo: '',
    direccion: '', tipoPersona: 'Física', vendedor: '', folioCliente: '',
    fechaAlta: new Date().toISOString().split('T')[0], capturo: 'Admin'
  });

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="clientes-modal-panel clientes-modal-form-panel"
    >
      <div className="clientes-modal-header">
        
        <h2 className="clientes-modal-title">{title}</h2>
        <button onClick={onClose} className="clientes-modal-close-btn">
          <FiX />
        </button>
      </div>

      <form className="clientes-modal-form-content">
        <div className="clientes-form-section">
          <h3 className="clientes-form-section-title">Información Personal</h3>
          <div className="clientes-form-grid">
            <div className="clientes-form-group">
              <label>Nombre Completo *</label>
              <input 
                type="text" 
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                placeholder="Ej: Juan Pérez García"
                required
              />
            </div>
            <div className="clientes-form-group">
              <label>Folio Cliente</label>
              <input 
                type="text" 
                value={formData.folioCliente}
                onChange={(e) => setFormData({...formData, folioCliente: e.target.value})}
                placeholder="CLI-XXX"
              />
            </div>
            <div className="clientes-form-group">
              <label>RFC *</label>
              <input 
                type="text" 
                value={formData.rfc}
                onChange={(e) => setFormData({...formData, rfc: e.target.value})}
                placeholder="XXXX000101XXX"
                required
              />
            </div>
            <div className="clientes-form-group">
              <label>CURP</label>
              <input 
                type="text" 
                value={formData.curp}
                onChange={(e) => setFormData({...formData, curp: e.target.value})}
                placeholder="CURP del cliente"
              />
            </div>
            <div className="clientes-form-group">
              <label>Tipo de Persona</label>
              <select 
                value={formData.tipoPersona}
                onChange={(e) => setFormData({...formData, tipoPersona: e.target.value})}
              >
                <option value="Física">Física</option>
                <option value="Moral">Moral</option>
              </select>
            </div>
            <div className="clientes-form-group">
              <label>Fecha de Alta</label>
              <input 
                type="date" 
                value={formData.fechaAlta}
                onChange={(e) => setFormData({...formData, fechaAlta: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="clientes-form-section">
          <h3 className="clientes-form-section-title">Contacto</h3>
          <div className="clientes-form-grid">
            <div className="clientes-form-group">
              <label>Email *</label>
              <input 
                type="email" 
                value={formData.correo}
                onChange={(e) => setFormData({...formData, correo: e.target.value})}
                placeholder="cliente@email.com"
                required
              />
            </div>
            <div className="clientes-form-group">
              <label>Teléfono *</label>
              <input 
                type="text" 
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                placeholder="(999) 999-9999"
                required
              />
            </div>
            <div className="clientes-form-group">
              <label>WhatsApp</label>
              <input 
                type="text" 
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                placeholder="+5219999999999"
              />
            </div>
            <div className="clientes-form-group clientes-full-width">
              <label>Dirección</label>
              <input 
                type="text" 
                value={formData.direccion}
                onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                placeholder="Calle, número, colonia, ciudad"
              />
            </div>
          </div>
        </div>

        <div className="clientes-form-section">
          <h3 className="clientes-form-section-title">Información Comercial</h3>
          <div className="clientes-form-grid">
            <div className="clientes-form-group">
              <label>Vendedor *</label>
              <input 
                type="text"
                value={formData.vendedor}
                onChange={(e) => setFormData({...formData, vendedor: e.target.value})}
                placeholder="Nombre del vendedor"
                list="vendedores-list"
                required
              />
              <datalist id="vendedores-list">
                {vendedores.map(v => <option key={v} value={v} />)}
              </datalist>
            </div>
            <div className="clientes-form-group">
              <label>Capturó</label>
              <input 
                type="text" 
                value={formData.capturo}
                readOnly
                className="clientes-readonly-field"
              />
            </div>
          </div>
        </div>

        <div className="clientes-form-actions">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onClose}
            className="clientes-btn-cancel"
          >
            Cancelar
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="clientes-btn-save"
          >
            Guardar Cliente
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

// Perfil detallado
const PerfilDetallado = ({ onClose, data }) => (
  <motion.div 
    initial={{ scale: 0.9, opacity: 0, y: 20 }}
    animate={{ scale: 1, opacity: 1, y: 0 }}
    exit={{ scale: 0.9, opacity: 0, y: 20 }}
    className="clientes-modal-panel clientes-modal-perfil"
  >
    <button onClick={onClose} className="clientes-modal-perfil-close">
      <FiX />
    </button>

    <div className="clientes-perfil-header">
      <div className="clientes-perfil-avatar">
        {data.nombre.charAt(0)}
      </div>
      <div className="clientes-perfil-title">
        <h2>{data.nombre}</h2>
        <span className={`clientes-perfil-status ${data.estatus.toLowerCase()}`}>
          {data.estatus}
        </span>
      </div>
    </div>

    <div className="clientes-perfil-grid">
      <div className="clientes-perfil-section">
        <h3 className="clientes-perfil-section-title">
          <FiUser /> Información Personal
        </h3>
        <div className="clientes-perfil-info-grid">
          <InfoItem label="Folio Cliente" value={data.folioCliente} icon={FiFileText} />
          <InfoItem label="RFC" value={data.rfc} icon={FiFileText} />
          <InfoItem label="CURP" value={data.curp} icon={FiFileText} />
          <InfoItem label="Tipo de Persona" value={data.tipoPersona} icon={FiUser} />
        </div>
      </div>

      <div className="clientes-perfil-section">
        <h3 className="clientes-perfil-section-title">
          <FiPhone /> Contacto
        </h3>
        <div className="clientes-perfil-info-grid">
          <InfoItem label="Email" value={data.correo} icon={FiMail} />
          <InfoItem label="Teléfono" value={data.telefono} icon={FiPhone} />
          <InfoItem label="WhatsApp" value={data.whatsapp} icon={FiSmartphone} />
          <InfoItem label="Dirección" value={data.direccion} icon={FiMapPin} />
        </div>
      </div>

      <div className="clientes-perfil-section">
        <h3 className="clientes-perfil-section-title">
          <FiBriefcase /> Información Comercial
        </h3>
        <div className="clientes-perfil-info-grid">
          <InfoItem label="Vendedor" value={data.vendedor} icon={FiUserCheck} />
          <InfoItem label="Capturó" value={data.capturo} icon={FiUser} />
          <InfoItem label="Fecha de Alta" value={new Date(data.fechaAlta).toLocaleDateString('es-MX')} icon={FiCalendar} />
        </div>
      </div>
    </div>

    <div className="clientes-perfil-actions">
      <a 
        href={`https://wa.me/${data.whatsapp?.replace('+', '')}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="clientes-perfil-whatsapp"
      >
        <FiMessageCircle /> WhatsApp
      </a>
      <button onClick={onClose} className="clientes-perfil-cerrar">
        Cerrar
      </button>
    </div>
  </motion.div>
);

const InfoItem = ({ label, value, icon: Icon }) => (
  <div className="clientes-info-item">
    <div className="clientes-info-label">
      <Icon size={12} />
      <span>{label}</span>
    </div>
    <div className="clientes-info-value">{value || '—'}</div>
  </div>
);

const AlertaEliminar = ({ onClose, data }) => (
  <motion.div 
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.9, opacity: 0 }}
    className="clientes-modal-panel clientes-modal-delete"
  >
    <div className="clientes-delete-icon-container">
      <FiAlertCircle />
    </div>
    <h3 className="clientes-delete-title">¿Eliminar Cliente?</h3>
    <p className="clientes-delete-text">
      Vas a eliminar a <strong>{data.nombre}</strong>. Esta acción no se puede deshacer.
    </p>
    <div className="clientes-delete-actions">
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClose}
        className="clientes-delete-confirm"
      >
        Eliminar Ahora
      </motion.button>
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClose}
        className="clientes-delete-cancel"
      >
        Cancelar
      </motion.button>
    </div>
  </motion.div>
);

const ModalDocumento = ({ onClose }) => (
  <motion.div 
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.9, opacity: 0 }}
    className="clientes-modal-panel clientes-modal-documento"
  >
    <FiDownloadCloud className="clientes-documento-icon" />
    <h3 className="clientes-documento-title">Escanear Documento</h3>
    <p className="clientes-documento-text">Coloca el documento frente a la cámara para escanearlo</p>
    <button onClick={onClose} className="clientes-documento-button">
      Cerrar
    </button>
  </motion.div>
);

export default Clientes;