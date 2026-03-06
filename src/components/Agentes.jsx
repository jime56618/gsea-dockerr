import React, { useState, useMemo, Fragment } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Menu, Transition, Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, UserPlus, MoreVertical, Edit2, Trash2, 
  ChevronLeft, ChevronRight, X, AlertTriangle, Mail, 
  Phone, MapPin, Building, User, Users, CheckCircle2, XCircle,
  Filter, Calendar, ArrowUpDown, ChevronDown
} from 'lucide-react';

import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './css/Agentes.css';

export default function SeccionAgentes() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  
  const [data, setData] = useState(initialData);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  

  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroEmpresa, setFiltroEmpresa] = useState('todos');
  const [ordenamiento, setOrdenamiento] = useState('reciente');
  
  // Estados Modales
  const [agentToEdit, setAgentToEdit] = useState(null);
  const [agentToDelete, setAgentToDelete] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const empresas = useMemo(() => {
    const unique = [...new Set(data.map(item => item.empresa))];
    return ['todos', ...unique];
  }, [data]);

  // Aplicar filtros a los datos
  const datosFiltrados = useMemo(() => {
    let filtered = [...data];

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      filtered = filtered.filter(item => item.estado === filtroEstado);
    }

    // Filtro por empresa
    if (filtroEmpresa !== 'todos') {
      filtered = filtered.filter(item => item.empresa === filtroEmpresa);
    }

    // Ordenamiento
    switch (ordenamiento) {
      case 'reciente':
        // Asumiendo que los IDs más altos son más recientes
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'antiguo':
        filtered.sort((a, b) => a.id - b.id);
        break;
      case 'nombre':
        filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      default:
        break;
    }

    return filtered;
  }, [data, filtroEstado, filtroEmpresa, ordenamiento]);

  const stats = useMemo(() => ({
    total: datosFiltrados.length,
    activos: datosFiltrados.filter(a => a.estado === 'Activo').length,
    inactivos: datosFiltrados.filter(a => a.estado === 'Inactivo').length
  }), [datosFiltrados]);

  const columns = useMemo(() => [
    {
      accessorKey: 'nombre',
      header: 'Agente',
      cell: info => (
        <div className="agents-agent-cell">
          <button className="agents-agent-name">
            {/* Se sustituyó la imagen por el SVG solicitado */}
            <svg 
              stroke="currentColor" 
              fill="none" 
              strokeWidth="2" 
              viewBox="0 0 24 24" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="agents-agent-avatar tramites-agent-icon" 
              height="1em" 
              width="1em" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <div className="agents-agent-info">
              <p className="agents-agent-fullname">{info.getValue()}</p>
              <p className="agents-agent-email">{info.row.original.email}</p>
            </div>
          </button>
        </div>
      ),
    },
    { 
      accessorKey: 'empresa', 
      header: 'Empresa', 
      cell: info => <span className="agents-company-badge">{info.getValue()}</span> 
    },
    { 
      accessorKey: 'telefono', 
      header: 'Teléfono', 
      cell: info => <span className="agents-phone-text">{info.getValue()}</span> 
    },
    { 
      accessorKey: 'ciudad', 
      header: 'Ciudad', 
      cell: info => <span className="agents-city-text">{info.getValue()}</span> 
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: info => (
        <span className={`agents-status-badge ${info.getValue() === 'Activo' ? 'agents-status-active' : 'agents-status-inactive'}`}>
          {info.getValue()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: info => (
        <Menu as="div" className="agents-actions-menu">
          <Menu.Button as="div" className="agents-actions-button">
            < MoreVertical size={18} />
          </Menu.Button>
          <Transition as={Fragment} enter="transition duration-100 ease-out" enterFrom="transform scale-95 opacity-0" enterTo="transform scale-100 opacity-100" leave="transition duration-75 ease-in" leaveFrom="transform scale-100 opacity-100" leaveTo="transform scale-95 opacity-0">
            <Menu.Items className="agents-menu-items">
              <div className="p-1">
                <Menu.Item>
                  {({ active }) => (
                    <button onClick={() => setAgentToEdit(info.row.original)} className={`agents-menu-item ${active ? 'agents-menu-item-active' : ''}`}>
                      <Edit2 size={16} className="mr-2" /> Editar
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button onClick={() => setAgentToDelete(info.row.original)} className={`agents-menu-item ${active ? 'agents-menu-item-delete-active' : 'agents-menu-item-delete'}`}>
                      <Trash2 size={16} className="mr-2" /> Eliminar
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      ),
    },
  ], []);

  const table = useReactTable({
    data: datosFiltrados,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <div className="agents-container">
      <Sidebar onExpand={setIsSidebarExpanded} /> 

      <div className={`agents-main-content ${isSidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        <Navbar /> 

        <main className="agents-main">
          
          <div className="agents-page-header">
            <h1 className="agents-page-title">Agentes</h1>
            <p className="agents-page-subtitle">Gestiona los permisos y perfiles de tu equipo.</p>
          </div>

          {/* Tarjetas de estadísticas */}
          <div className="agents-stats-grid">
            <StatCard 
              label="Total de Agentes" 
              value={stats.total} 
              icon={<Users size={24}/>} 
              color="agents-blue" 
            />
            <StatCard 
              label="Agentes Activos" 
              value={stats.activos} 
              icon={<CheckCircle2 size={24}/>} 
              color="agents-green" 
            />
            <StatCard 
              label="Agentes Inactivos" 
              value={stats.inactivos} 
              icon={<XCircle size={24}/>} 
              color="agents-red" 
            />
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="agents-filters-section">
            <div className="agents-search-wrapper">
              <Search className="agents-search-icon" size={20} />
              <input 
                type="text" 
                value={globalFilter} 
                onChange={e => setGlobalFilter(e.target.value)} 
                placeholder="Buscar por nombre, empresa..." 
                className="agents-search-input"
              />
            </div>

            <div className="agents-filters-wrapper">
              {/* Filtro de ordenamiento */}
              <div className="agents-filter-group">
                <Calendar size={16} className="agents-filter-icon" />
                <select 
                  value={ordenamiento} 
                  onChange={(e) => setOrdenamiento(e.target.value)}
                  className="agents-filter-select"
                >
                  <option value="reciente">Más reciente</option>
                  <option value="antiguo">Más antiguo</option>
                  <option value="nombre">Por nombre</option>
                </select>
                <ChevronDown size={14} className="agents-select-chevron" />
              </div>

              {/* Filtro por estado */}
              <div className="agents-filter-group">
                <Filter size={16} className="agents-filter-icon" />
                <select 
                  value={filtroEstado} 
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="agents-filter-select"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="Activo">Activos</option>
                  <option value="Inactivo">Inactivos</option>
                </select>
                <ChevronDown size={14} className="agents-select-chevron" />
              </div>

              {/* Filtro por empresa */}
              <div className="agents-filter-group">
                <Building size={16} className="agents-filter-icon" />
                <select 
                  value={filtroEmpresa} 
                  onChange={(e) => setFiltroEmpresa(e.target.value)}
                  className="agents-filter-select"
                >
                  <option value="todos">Todas las empresas</option>
                  {empresas.filter(e => e !== 'todos').map(empresa => (
                    <option key={empresa} value={empresa}>{empresa}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="agents-select-chevron" />
              </div>

              <button onClick={() => setIsAddModalOpen(true)} className="agents-add-button">
                <UserPlus size={18} />
                <span>Agregar</span>
              </button>
            </div>
          </div>

          {/* Tabla de agentes */}
          <div className="agents-table-container">
            <div className="agents-table-header">
              <h2 className="agents-table-title">Lista de Agentes</h2>
              {(filtroEstado !== 'todos' || filtroEmpresa !== 'todos' || ordenamiento !== 'reciente' || globalFilter !== '') && (
                <button 
                  className="agents-clear-filters"
                  onClick={() => {
                    setFiltroEstado('todos');
                    setFiltroEmpresa('todos');
                    setOrdenamiento('reciente');
                    setGlobalFilter('');
                  }}
                >
                  <X size={14} />
                  Limpiar filtros
                </button>
              )}
            </div>
            
            <div className="agents-table-responsive">
              <table className="agents-table">
                <thead>
                  {table.getHeaderGroups().map(hg => (
                    <tr key={hg.id}>
                      {hg.headers.map(header => (
                        <th key={header.id} className="agents-table-head" onClick={header.column.getToggleSortingHandler()}>
                          <div className="agents-table-head-content">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              <ArrowUpDown size={14} className="agents-sort-icon" />
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="agents-table-row">
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="agents-table-cell">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="agents-table-empty">
                        <div className="agents-empty-state">
                          <Users size={48} className="agents-empty-icon" />
                          <p className="agents-empty-text">No se encontraron agentes</p>
                          <p className="agents-empty-subtext">Intenta con otros filtros</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="agents-pagination">
              <p className="agents-pagination-info">
                Mostrando {table.getRowModel().rows.length} de {datosFiltrados.length} registros
              </p>
              <div className="agents-pagination-controls">
                <button 
                  onClick={() => table.previousPage()} 
                  disabled={!table.getCanPreviousPage()} 
                  className="agents-pagination-button"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="agents-pagination-page">
                  Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                </span>
                <button 
                  onClick={() => table.nextPage()} 
                  disabled={!table.getCanNextPage()} 
                  className="agents-pagination-button"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Agregar/Editar */}
      <AnimatePresence>
        {(agentToEdit || isAddModalOpen) && (
          <Dialog as="div" className="agents-modal" onClose={() => {setAgentToEdit(null); setIsAddModalOpen(false);}} open={true}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="agents-modal-overlay" />
            <div className="agents-modal-container">
              <Dialog.Panel className="agents-modal-panel">
                <div className="agents-modal-header">
                  <h2 className="agents-modal-title">{agentToEdit ? 'Editar Agente' : 'Agregar Nuevo Agente'}</h2>
                  <button onClick={() => {setAgentToEdit(null); setIsAddModalOpen(false);}} className="agents-modal-close">
                    <X size={20}/>
                  </button>
                </div>
                <div className="agents-modal-form">
                  <ModalInput label="Nombre Completo" icon={<User size={16}/>} defaultValue={agentToEdit?.nombre || ''} />
                  <ModalInput label="Empresa" icon={<Building size={16}/>} defaultValue={agentToEdit?.empresa || ''} />
                  <ModalInput label="Email" icon={<Mail size={16}/>} defaultValue={agentToEdit?.email || ''} />
                  <ModalInput label="Teléfono" icon={<Phone size={16}/>} defaultValue={agentToEdit?.telefono || ''} />
                  <ModalInput label="Ubicación" icon={<MapPin size={16}/>} defaultValue={agentToEdit?.ciudad || ''} className="agents-full-width" />
                </div>
                <div className="agents-modal-actions">
                  <button onClick={() => {setAgentToEdit(null); setIsAddModalOpen(false);}} className="agents-modal-cancel">
                    Cancelar
                  </button>
                  <button className="agents-modal-confirm">
                    Guardar Cambios
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Modal de Eliminar */}
      <AnimatePresence>
        {agentToDelete && (
          <Dialog as="div" className="agents-modal" onClose={() => setAgentToDelete(null)} open={true}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="agents-modal-overlay agents-modal-overlay-delete" />
            <div className="agents-modal-container">
              <Dialog.Panel className="agents-modal-panel agents-modal-panel-delete">
                <div className="agents-delete-icon">
                  <AlertTriangle size={40} />
                </div>
                <h3 className="agents-delete-title">¿Eliminar Agente?</h3>
                <p className="agents-delete-text">
                  Vas a eliminar a {agentToDelete?.nombre || 'este agente'}. Esta acción no se puede deshacer.
                </p>
                <button 
                  onClick={() => {
                    if (agentToDelete) {
                      setData(data.filter(a => a.id !== agentToDelete.id));
                      setAgentToDelete(null);
                    }
                  }} 
                  className="agents-delete-confirm"
                >
                  Eliminar Ahora
                </button>
                <button onClick={() => setAgentToDelete(null)} className="agents-delete-cancel">
                  Cancelar
                </button>
              </Dialog.Panel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <motion.div 
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="agents-stat-card"
    >
      <div className="agents-stat-content">
        <div>
          <p className="agents-stat-label">{label}</p>
          <p className="agents-stat-value">{value}</p>
        </div>
        <div className={`agents-stat-icon ${color}`}>
          {icon}
        </div>
      </div>
      <div className="agents-stat-trend">
        <span className="agents-trend-indicator"></span>
        <span className="agents-trend-text">Total registrado</span>
      </div>
    </motion.div>
  );
}

function ModalInput({ label, icon, className = '', ...props }) {
  return (
    <div className={`agents-modal-input-group ${className}`}>
      <label className="agents-modal-input-label">{label}</label>
      <div className="agents-modal-input-wrapper">
        <span className="agents-modal-input-icon">{icon}</span>
        <input {...props} className="agents-modal-input-field" />
      </div>
    </div>
  );
}

const initialData = [
  { id: 1, nombre: 'Jane Cooper', empresa: 'AXA', telefono: '+1 (225) 555-0118', email: 'jane.cooper@axa.com', ciudad: 'Sonora', estado: 'Activo', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 2, nombre: 'Floyd Miles', empresa: 'BBVA', telefono: '+1 (205) 555-0100', email: 'floyd.miles@bbva.com', ciudad: 'Yucatán', estado: 'Inactivo', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 3, nombre: 'Ronald Richards', empresa: 'GNP', telefono: '+1 (302) 555-0107', email: 'ronald.richards@gnp.com', ciudad: 'CDMX', estado: 'Activo', avatar: 'https://randomuser.me/api/portraits/men/46.jpg' },
  { id: 4, nombre: 'Marvin McKinney', empresa: 'BX+', telefono: '+1 (252) 555-0126', email: 'marvin.mckinney@bx.com', ciudad: 'Monterrey', estado: 'Activo', avatar: 'https://randomuser.me/api/portraits/men/22.jpg' },
  { id: 5, nombre: 'Brooklyn Zoe', empresa: 'HSBC', telefono: '+1 (212) 555-0134', email: 'brooklyn.z@hsbc.com', ciudad: 'Nuevo León', estado: 'Inactivo', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { id: 6, nombre: 'Alice Krejčová', empresa: 'BBVA', telefono: '+1 (205) 555-0101', email: 'alice.k@bbva.com', ciudad: 'Puebla', estado: 'Activo', avatar: 'https://randomuser.me/api/portraits/women/63.jpg' },
  { id: 7, nombre: 'Jurriaan van den Bos', empresa: 'ING', telefono: '+1 (302) 555-0108', email: 'jurriaan.v@ing.com', ciudad: 'Querétaro', estado: 'Activo', avatar: 'https://randomuser.me/api/portraits/men/51.jpg'},
  { id: 8, nombre: 'Samantha Smith', empresa: 'Santander', telefono: '+1 (212) 555-0145', email: 'samantha.s@santander.com', ciudad: 'Tamaulipas', estado: 'Activo', avatar: 'https://randomuser.me/api/portraits/women/63.jpg'},
  { id: 9, nombre: 'John Doe', empresa: 'BBVA', telefono: '+1 (205) 555-0101', email: 'john.d@bbva.com', ciudad: 'Tamaulipas', estado: 'Activo', avatar: 'https://randomuser.me/api/portraits/men/51.jpg'},
];