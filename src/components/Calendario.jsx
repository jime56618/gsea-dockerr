import React, { useState, useRef, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";

import {
  MessageSquare,
  Send,
  X,
  Trash,
  Edit,
  Calendar,
  Clock,
  Bell,
  AlertCircle,
  CheckCircle2,
  Plus,
  Filter,
  ChevronDown,
  MoreVertical,
  User,
  FileText,
  DollarSign,
  XCircle,
  ClipboardList,
  Users
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "./css/Calendario.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data.message ||
      (data.errors && Object.values(data.errors).flat().join(" ")) ||
      `Error HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

function colorForCuotaEstatus(estatus) {
  switch (estatus) {
    case "pagado":
      return "#16a34a";
    case "vencido":
    case "cancelado":
      return "#dc2626";
    default:
      return "#2563eb";
  }
}

function mapCuotaToFcEvent(c) {
  const fecha = (c.fecha_programada || "").toString().slice(0, 10);
  const cliente = c.poliza?.contratante?.nombre || "Cliente";
  const numPol = c.poliza?.numero_poliza || "";
  return {
    id: String(c.id),
    title: `Cuota ${c.numero_cuota} · ${cliente}`,
    start: fecha,
    allDay: true,
    backgroundColor: colorForCuotaEstatus(c.estatus),
    extendedProps: {
      cuotaId: c.id,
      cliente,
      monto: new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(Number(c.monto)),
      montoRaw: c.monto,
      estatus: c.estatus,
      poliza: numPol,
      clienteId: null,
    },
  };
}

function mapCalendarEventToFcEvent(e) {
  return {
    id: `manual-${e.id}`,
    title: e.title,
    start: e.starts_at,
    end: e.ends_at,
    backgroundColor: e.color || "#2563eb",

    extendedProps: {
      calendarEventId: e.id,
      cliente: e.title,
      descripcion: e.description,
      googleEventId: e.google_event_id,

      // Nuevos campos
      type: e.type,
      priority: e.priority,
      status: e.status,
    },
  };
}

const CLIENTES_DATA = [
  { id: 1, nombre: "Juan Pérez", poliza: "GSEA-10023", monto: "$2,350", inicial: "J", email: "juan@email.com", telefono: "+52 555 123 4567" },
  { id: 2, nombre: "María Gómez", poliza: "GSEA-10024", monto: "$1,980", inicial: "M", email: "maria@email.com", telefono: "+52 555 234 5678" },
  { id: 3, nombre: "Luis Rodríguez", poliza: "GSEA-10025", monto: "$3,120", inicial: "L", email: "luis@email.com", telefono: "+52 555 345 6789" }
];

export default function CobranzaPage() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [chatModal, setChatModal] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState("");
  const [taskCategory, setTaskCategory] = useState("follow_up");

  const [newType, setNewType] = useState("follow_up");
  const [newPriority, setNewPriority] = useState("medium");
  const [newStatus, setNewStatus] = useState("pending");

  const [activityTypeModal, setActivityTypeModal] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState("");

  const [contextMenu, setContextMenu] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  const [createModal, setCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newColor, setNewColor] = useState("#2563eb");
  const [newCliente, setNewCliente] = useState(null);

  const [tasks, setTasks] = useState([
    { id: 1, text: "Llamar a Juan Pérez", urgent: true, completed: false, fecha: "2024-03-06" },
    { id: 2, text: "Recordatorio pago María", urgent: false, completed: false, fecha: "2024-03-07" },
    { id: 3, text: "Enviar póliza a Luis", urgent: true, completed: true, fecha: "2024-03-05" },
    { id: 4, text: "Revisar documentación", urgent: false, completed: false, fecha: "2024-03-08" }
  ]);

  const [taskFilter, setTaskFilter] = useState("all");
  const [showTaskFilters, setShowTaskFilters] = useState(false);

  const [events, setEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState("");
  const lastCalendarDateRef = useRef(null);

  const loadCuotasForView = useCallback(async (date) => {
  lastCalendarDateRef.current = date;
  const y = date.getFullYear();
  const m = date.getMonth() + 1;

  setCalendarLoading(true);
  setCalendarError("");

  try {
    const [cuotasRes, eventsRes] = await Promise.all([
      fetchJson(`${API_URL}/calendar/cobranza-cuotas?year=${y}&month=${m}`),
      fetchJson(`${API_URL}/calendar/events`),
    ]);

    const cuotas = Array.isArray(cuotasRes) ? cuotasRes.map(mapCuotaToFcEvent) : [];
    const manualEvents = Array.isArray(eventsRes) ? eventsRes.map(mapCalendarEventToFcEvent) : [];

    setEvents([...cuotas, ...manualEvents]);
  } catch (e) {
    setCalendarError(e.message || "No se pudieron cargar los eventos");
    setEvents([]);
  } finally {
    setCalendarLoading(false);
  }
}, []);

  const [chats, setChats] = useState({
    1: [
      { from: "cliente", text: "Hola, ¿cuándo vence mi póliza?", time: "10:30 AM" },
      { from: "agente", text: "Hola Juan, vence el 10 de marzo.", time: "10:32 AM" }
    ],
    2: [
      { from: "cliente", text: "Gracias por la información.", time: "11:15 AM" },
      { from: "agente", text: "Con gusto María.", time: "11:16 AM" }
    ],
    3: [
      { from: "cliente", text: "Quiero renovar mi seguro.", time: "09:45 AM" },
      { from: "agente", text: "Claro Luis, te envío opciones.", time: "09:47 AM" }
    ]
  });

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openChatFromEvent = (info) => {
    const ep = info.event.extendedProps || {};
    if (ep.cuotaId != null) {
      setActiveChat({
        id: ep.cuotaId,
        nombre: ep.cliente || "Cliente",
        poliza: ep.poliza || "",
        monto: ep.monto || "",
        inicial: (ep.cliente || "C").charAt(0).toUpperCase(),
      });
    } else {
      const cliente =
        CLIENTES_DATA.find((c) => c.id === ep.clienteId) || CLIENTES_DATA[0];
      setActiveChat(cliente);
    }
    setChatModal(true);
  };

  const handleDeleteClick = () => {
    if (contextMenu) {
      setEventToDelete(contextMenu.event);
      setDeleteModal(true);
      setContextMenu(null);
    }
  };

  const deleteEvent = async () => {
    if (!eventToDelete) return;
    const cuotaId = eventToDelete.extendedProps?.cuotaId;
    if (cuotaId != null) {
      try {
        await fetchJson(`${API_URL}/cobranza_cuotas/${cuotaId}`, { method: "DELETE" });
        if (lastCalendarDateRef.current) {
          await loadCuotasForView(lastCalendarDateRef.current);
        }
      } catch (e) {
        window.alert(e.message || "Error al eliminar");
        return;
      }
    } else {
      const calendarEventId = eventToDelete.extendedProps?.calendarEventId;

    if (calendarEventId) {
      try {
        await fetchJson(`${API_URL}/calendar/events/${calendarEventId}`, {
          method: "DELETE",
        });
    
        if (lastCalendarDateRef.current) {
          await loadCuotasForView(lastCalendarDateRef.current);
        }
      } catch (e) {
        window.alert(e.message || "Error al eliminar");
        return;
      }
    } else {
      setEvents(events.filter((e) => e.id !== eventToDelete.id));
    }
    }
    setDeleteModal(false);
    setEventToDelete(null);
  };

  const openEditModal = () => {
    const ev = contextMenu.event;
    const ext = ev.extendedProps || {};
    const startDay = ev.startStr ? ev.startStr.slice(0, 10) : "";
    setEditingEvent({
      id: ev.id,
      cuotaId: ext.cuotaId ?? null,
      title: ev.title,
      start: ev.startStr ? ev.startStr.slice(0, 16) : "",
      color: ev.backgroundColor || "#2563eb",
      monto: ext.montoRaw != null ? String(ext.montoRaw) : "",
      estatus: ext.estatus ?? "pendiente",
      calendarEventId: ext.calendarEventId ?? null,
      type: ext.type ?? "follow_up",
      priority: ext.priority ?? "medium",
      status: ext.status ?? "pending",
    });
    setEditModal(true);
    setContextMenu(null);
  };

  const saveEventEdit = async () => {
    if (!editingEvent) return;
    if (editingEvent.cuotaId != null) {
      try {
        await fetchJson(`${API_URL}/cobranza_cuotas/${editingEvent.cuotaId}`, {
          method: "PUT",
          body: JSON.stringify({
            fecha_programada: editingEvent.start,
            monto: Number(editingEvent.monto),
            estatus: editingEvent.estatus,
          }),
        });
        if (lastCalendarDateRef.current) {
          await loadCuotasForView(lastCalendarDateRef.current);
        }
      } catch (e) {
        window.alert(e.message || "Error al guardar");
        return;
      }
    } else {
      try {
      await fetchJson(`${API_URL}/calendar/events/${editingEvent.calendarEventId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editingEvent.title,
          starts_at: editingEvent.start,
          ends_at: "",
          color: editingEvent.color,
          type: editingEvent.type,
          priority: editingEvent.priority,
          status: editingEvent.status,
        }),
      });
    
      if (lastCalendarDateRef.current) {
        await loadCuotasForView(lastCalendarDateRef.current);
      }
    } catch (e) {
      window.alert(e.message || "Error al guardar");
      return;
    }
    }
    setEditModal(false);
  };

  const sendMessage = () => {
    const cliente = CLIENTES_DATA[0];
    const plantilla = `Hola ${cliente.nombre} 👋

Te recordamos que tu póliza presenta un pago pendiente.

📄 Póliza: ${cliente.poliza}
💰 Monto a pagar: ${cliente.monto}

Puedes realizar tu pago para mantener activa tu cobertura.

Si tienes alguna duda estoy para ayudarte.`;

    setActiveChat(cliente);
    setMessage(plantilla);
    setChatModal(true);
    setContextMenu(null);
  };

  const sendChatMessage = () => {
    if (!message || !activeChat) return;

    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

    const prev = chats[activeChat.id] || [];
    const updated = [...prev, { from: "agente", text: message, time }];

    setChats({
      ...chats,
      [activeChat.id]: updated
    });

    setMessage("");
  };

  const createEvent = async () => {
  if (!newDate || !newCliente) return;

  try {
    await fetchJson(`${API_URL}/calendar/events`, {
      method: "POST",
      body: JSON.stringify({
        title: `${newTitle || "Recordatorio"} - ${newCliente.nombre}`,
        description: `Cliente: ${newCliente.nombre}
        Póliza: ${newCliente.poliza}
        Monto: ${newCliente.monto}`,
        starts_at: newDate,
        ends_at: "",
        color: newColor,
        type: newType === "task" ? taskCategory : newType,
        priority: newPriority,
        status: newStatus,
        meeting_provider: newType === "meeting" ? "google_meet" : null,
        attendee_name: newCliente?.nombre || null,
        attendee_email: newCliente?.email || null,
      }),
    });

    if (lastCalendarDateRef.current) {
      await loadCuotasForView(lastCalendarDateRef.current);
    }

    setCreateModal(false);
    setNewTitle("");
    setNewDate("");
    setNewCliente(null);
  } catch (e) {
    alert(e.message || "Error al crear recordatorio");
  }
};
  
  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  const filteredTasks = tasks.filter(task => {
    if (taskFilter === "pending") return !task.completed;
    if (taskFilter === "completed") return task.completed;
    if (taskFilter === "urgent") return task.urgent;
    return true;
  });

  const getTaskCount = (filter) => {
    if (filter === "pending") return tasks.filter(t => !t.completed).length;
    if (filter === "completed") return tasks.filter(t => t.completed).length;
    if (filter === "urgent") return tasks.filter(t => t.urgent).length;
    return tasks.length;
  };

  // Renderizado personalizado para eventos en vista mes - CORREGIDO
  
  const renderEventContent = (eventInfo) => {
  const isAllDay = !eventInfo.timeText;
  const timeText = eventInfo.timeText || "Todo el día";

  return (
    <div className="cobranza-event-card">
      {!isAllDay && (
        <div className="cobranza-event-time">
          {timeText}
        </div>
      )}
      <div className="cobranza-event-title" title={eventInfo.event.title}>
        {eventInfo.event.title}
      </div>
    </div>
  );
};

const addOneHour = (dateStr) => {
  if (!dateStr) return "";

  const d = new Date(dateStr);
  d.setHours(d.getHours() + 1);

  return d.toISOString().slice(0, 16);
};

const meetingPreviewEvents = [
  ...events,
  ...(newType === "meeting" && newDate
    ? [
        {
          id: "preview-meeting",
          title: newTitle || "Nueva reunión",
          start: newDate,
          end: addOneHour(newDate),
          backgroundColor: "#2563eb",
          borderColor: "#2563eb",
        },
      ]
    : []),
];

return (
    <div className="cobranza-container">
      <Sidebar onExpand={setIsSidebarExpanded} />

      <div className={`cobranza-main-content ${isSidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
        <Navbar />

        <main className="cobranza-main">
          {/* Header */}
          <div className="cobranza-header">
            <div>
              <h1 className="cobranza-title">Cobranza y Seguimiento</h1>
              <p className="cobranza-subtitle">
              </p>
              {calendarError && (
                <p style={{ color: "#b91c1c", marginTop: 8 }}>{calendarError}</p>
              )}
              {calendarLoading && (
                <p style={{ opacity: 0.8, marginTop: 4 }}>Cargando cuotas del mes…</p>
              )}
            </div>
            
            <div className="cobranza-header-actions">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivityTypeModal(true)}
                className="cobranza-btn-primary"
              >
                <Plus size={18} />
                <span>Nueva actividad</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setChatModal(true)}
                className="cobranza-btn-secondary"
              >
                <MessageSquare size={18} />
                <span>Chat Inteligente</span>
              </motion.button>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="cobranza-grid">
            {/* Calendario */}
            <motion.div 
              className="cobranza-calendar-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="cobranza-calendar-wrapper">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  datesSet={(info) => {
                    loadCuotasForView(info.view.currentStart);
                  }}
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay"
                  }}
                  events={events}
                  height="100%"
                  locale={esLocale}
                  timeZone="local"
                  slotMinTime="08:00:00"
                  slotMaxTime="20:00:00"
                  allDaySlot={true}
                  slotDuration="00:30:00"
                  eventClick={openChatFromEvent}
                  eventContent={renderEventContent}
                  eventDidMount={(info) => {
                    info.el.addEventListener("contextmenu", (e) => {
                      e.preventDefault();
                      setContextMenu({
                        x: e.pageX,
                        y: e.pageY,
                        event: info.event
                      });
                    });
                  }}
                  dayMaxEvents={3}
                  dayMaxEventRows={4}
                  moreLinkContent={(args) => {
                    return <div className="cobranza-more-link">+{args.num} más</div>;
                  }}
                  eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  }}
                />
              </div>
            </motion.div>

            {/* Panel de tareas */}
            <motion.div 
              className="cobranza-tasks-container"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="cobranza-tasks-header">
                <div className="cobranza-tasks-title">
                  <Bell size={20} />
                  <h2>Pendientes</h2>
                </div>
                
                <div className="cobranza-tasks-filter">
                  <button 
                    className="cobranza-filter-btn"
                    onClick={() => setShowTaskFilters(!showTaskFilters)}
                  >
                    <Filter size={16} />
                    <span>Filtrar</span>
                    <ChevronDown size={14} className={`cobranza-filter-chevron ${showTaskFilters ? 'open' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showTaskFilters && (
                      <motion.div 
                        className="cobranza-filter-dropdown"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <button 
                          className={`cobranza-filter-option ${taskFilter === 'all' ? 'active' : ''}`}
                          onClick={() => { setTaskFilter('all'); setShowTaskFilters(false); }}
                        >
                          Todos <span className="cobranza-filter-count">{getTaskCount('all')}</span>
                        </button>
                        <button 
                          className={`cobranza-filter-option ${taskFilter === 'pending' ? 'active' : ''}`}
                          onClick={() => { setTaskFilter('pending'); setShowTaskFilters(false); }}
                        >
                          Pendientes <span className="cobranza-filter-count">{getTaskCount('pending')}</span>
                        </button>
                        <button 
                          className={`cobranza-filter-option ${taskFilter === 'completed' ? 'active' : ''}`}
                          onClick={() => { setTaskFilter('completed'); setShowTaskFilters(false); }}
                        >
                          Completados <span className="cobranza-filter-count">{getTaskCount('completed')}</span>
                        </button>
                        <button 
                          className={`cobranza-filter-option ${taskFilter === 'urgent' ? 'active' : ''}`}
                          onClick={() => { setTaskFilter('urgent'); setShowTaskFilters(false); }}
                        >
                          Urgentes <span className="cobranza-filter-count">{getTaskCount('urgent')}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="cobranza-tasks-list">
                {filteredTasks.map(task => (
                  <motion.div
                    key={task.id}
                    className={`cobranza-task-item ${task.completed ? 'completed' : ''} ${task.urgent ? 'urgent' : ''}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="cobranza-task-check">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        id={`task-${task.id}`}
                      />
                      <label htmlFor={`task-${task.id}`} className="cobranza-check-label"></label>
                    </div>
                    
                    <div className="cobranza-task-content">
                      <p className={`cobranza-task-text ${task.completed ? 'completed' : ''}`}>
                        {task.text}
                      </p>
                      <div className="cobranza-task-meta">
                        <Calendar size={12} />
                        <span>{task.fecha}</span>
                        {task.urgent && (
                          <span className="cobranza-task-urgent">
                            <AlertCircle size={12} />
                            Urgente
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredTasks.length === 0 && (
                  <div className="cobranza-tasks-empty">
                    <CheckCircle2 size={40} />
                    <p>No hay tareas pendientes</p>
                  </div>
                )}
              </div>

              <div className="cobranza-tasks-footer">
                <div className="cobranza-tasks-stats">
                  <span>{tasks.filter(t => !t.completed).length} pendientes</span>
                  <span>{tasks.filter(t => t.completed).length} completados</span>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Menú contextual flotante */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            ref={menuRef}
            className="cobranza-context-menu"
            style={{
              position: "fixed",
              top: contextMenu.y,
              left: contextMenu.x,
              zIndex: 10000
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <button onClick={sendMessage} className="cobranza-context-item">
              <Send size={16} />
              <span>Enviar mensaje</span>
            </button>
            <button onClick={openEditModal} className="cobranza-context-item">
              <Edit size={16} />
              <span>Editar</span>
            </button>
            <button onClick={handleDeleteClick} className="cobranza-context-item delete">
              <Trash size={16} />
              <span>Eliminar</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Eliminar (con FiXCircle) */}
      <AnimatePresence>
        {deleteModal && eventToDelete && (
          <div className="cobranza-modal-overlay" onClick={() => setDeleteModal(false)}>
            <motion.div
              className="cobranza-modal cobranza-modal-delete"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <div className="cobranza-modal-delete-icon">
                <XCircle size={48} />
              </div>
              <h2 className="cobranza-modal-delete-title">¿Eliminar recordatorio?</h2>
              <p className="cobranza-modal-delete-text">
                Vas a eliminar el evento <strong>"{eventToDelete.title}"</strong>. Esta acción no se puede deshacer.
              </p>
              <div className="cobranza-modal-delete-actions">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="cobranza-btn-delete-cancel"
                  onClick={() => setDeleteModal(false)}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="cobranza-btn-delete-confirm"
                  onClick={deleteEvent}
                >
                  Eliminar ahora
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Editar */}
      <AnimatePresence>
        {editModal && editingEvent && (
          <div className="cobranza-modal-overlay" onClick={() => setEditModal(false)}>
            <motion.div
              className="cobranza-modal cobranza-modal-small"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <div className="cobranza-modal-header">
                
                <h2 className="cobranza-modal-title">Editar Recordatorio</h2>
                <button className="cobranza-modal-close" onClick={() => setEditModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="cobranza-modal-form">
                <div className="cobranza-form-group">
                  <label>Título</label>
                  <input
                    type="text"
                    value={editingEvent.title}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    placeholder="Título del recordatorio"
                    disabled={editingEvent.cuotaId != null}
                  />
                </div>

                {editingEvent.cuotaId != null && (
                  <>
                    <div className="cobranza-form-group">
                      <label>Fecha programada</label>
                      <input
                        type="date"
                        value={editingEvent.start || ""}
                        onChange={(e) =>
                          setEditingEvent({ ...editingEvent, start: e.target.value })
                        }
                      />
                    </div>
                    <div className="cobranza-form-group">
                      <label>Monto</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingEvent.monto}
                        onChange={(e) =>
                          setEditingEvent({ ...editingEvent, monto: e.target.value })
                        }
                      />
                    </div>
                    <div className="cobranza-form-group">
                      <label>Estatus</label>
                      <select
                        value={editingEvent.estatus}
                        onChange={(e) =>
                          setEditingEvent({ ...editingEvent, estatus: e.target.value })
                        }
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="pagado">Pagado</option>
                        <option value="vencido">Vencido</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="cobranza-form-group">
                  <label>Color</label>
                  <div className="cobranza-color-picker">
                    <input
                      type="color"
                      value={editingEvent.color}
                      onChange={(e) => setEditingEvent({ ...editingEvent, color: e.target.value })}
                      disabled={editingEvent.cuotaId != null}
                    />
                    <span>{editingEvent.color}</span>
                  </div>
                </div>

                <div className="cobranza-modal-actions">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="cobranza-btn-cancel"
                    onClick={() => setEditModal(false)}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="cobranza-btn-save"
                    onClick={saveEventEdit}
                  >
                    Guardar Cambios
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
  {activityTypeModal && (
    <div className="cobranza-modal-overlay" onClick={() => setActivityTypeModal(false)}>
      <motion.div
        className="cobranza-activity-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
      >
        <div className="cobranza-activity-header">
          <h2>¿Qué tipo de actividad vas a crear?</h2>
          <p>
            Tu agenda es tu mejor amiga. Marca cada actividad como completada
            y mantén tu seguimiento al día.
          </p>
        </div>

        <div className="cobranza-activity-options">
          <button
            type="button"
            className={`cobranza-activity-row ${selectedActivityType === "task" ? "active" : ""}`}
            onClick={() => setSelectedActivityType("task")}
          >
            <div className="cobranza-activity-icon"><ClipboardList size={22} /></div>
            <div className="cobranza-activity-text">
              <strong>Tarea</strong>
              <p>Planificar, llamar, contactar o registrar pendientes.</p>
            </div>
            <span className="cobranza-activity-radio" />
          </button>

          <button
            type="button"
            className={`cobranza-activity-row ${selectedActivityType === "meeting" ? "active" : ""}`}
            onClick={() => setSelectedActivityType("meeting")}
          >
            <div className="cobranza-activity-icon"><Users size={22} /></div>
            <div className="cobranza-activity-text">
              <strong>Reunión</strong>
              <p>Agenda reuniones online o presenciales con clientes.</p>
            </div>
            <span className="cobranza-activity-radio" />
          </button>
        </div>

        <div className="cobranza-activity-footer">
          <button
            className="cobranza-activity-cancel"
            onClick={() => setActivityTypeModal(false)}
          >
            Cancelar
          </button>

          <button
            className="cobranza-activity-confirm"
            disabled={!selectedActivityType}
            onClick={() => {
              setNewType(selectedActivityType);
              setActivityTypeModal(false);
            
              if (selectedActivityType === "meeting") {
                setNewTitle("");
                setNewColor("#2563eb");
              }
            
              setCreateModal(true);
            }}
          >
            Confirmar
          </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>

   
 
      {/* Modal de Crear Actividad */}
<AnimatePresence>
  {createModal && newType === "task" && (
    <div className="gsea-task-overlay" onClick={() => setCreateModal(false)}>
      <motion.div
        className="gsea-task-drawer"
        onClick={(e) => e.stopPropagation()}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
      >
        <div className="gsea-task-drawer-header">
          <h2>Agregar tarea</h2>
          <button onClick={() => setCreateModal(false)}>
            <X size={22} />
          </button>
        </div>

        <div className="gsea-task-tabs">
          <button className="active">Configuración</button>
          <button>Recordatorios</button>
        </div>

        <div className="gsea-task-body">
          

          <div className="gsea-task-row">
            <label>Tipo</label>
            <select
              value={taskCategory}
              onChange={(e) => {
                setTaskCategory(e.target.value);
          
                if (e.target.value === "collection") {
                  setNewColor("#f59e0b");
                  setNewTitle("Cobranza");
                }
          
                if (e.target.value === "renewal") {
                  setNewColor("#7c3aed");
                  setNewTitle("Renovación");
                }
          
                if (e.target.value === "follow_up") {
                  setNewColor("#2563eb");
                  setNewTitle("Seguimiento");
                }
              }}
            >
              <option value="follow_up">Seguimiento</option>
              <option value="collection">Cobranza</option>
              <option value="renewal">Renovación</option>
              <option value="task">Tarea general</option>
            </select>
          </div>


          <div className="gsea-task-row">
            <label>Nombre</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Nombre de la tarea"
            />
          </div>

          <div className="gsea-task-row">
            <label>Cliente</label>
            <select
              value={newCliente?.id || ""}
              onChange={(e) =>
                setNewCliente(CLIENTES_DATA.find(c => c.id === parseInt(e.target.value)))
              }
            >
              <option value="">Seleccionar cliente</option>
              {CLIENTES_DATA.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nombre} · {c.poliza}
                </option>
              ))}
            </select>
          </div>

          <div className="gsea-task-row">
            <label>Prioridad</label>
            <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          <div className="gsea-task-row">
            <label>Fecha</label>
            <input
              type="datetime-local"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>

          <label className="gsea-task-checkbox">
            <input type="checkbox" />
            <span>Todo el día</span>
          </label>

          <div className="gsea-task-row">
            <label>Descripción</label>
            <textarea
              rows="5"
              placeholder="Agrega una descripción..."
            />
          </div>
        </div>

        <div className="gsea-task-footer">
          <button className="gsea-related-btn">
            Relacionado con <strong>0</strong>
          </button>

          <div>
            <button className="gsea-task-cancel" onClick={() => setCreateModal(false)}>
              Cancelar
            </button>

            <button
              className="gsea-task-save"
              onClick={createEvent}
              disabled={!newDate || !newCliente}
            >
              Guardar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>


<AnimatePresence>
  {createModal && newType === "meeting" && (
    <div className="gsea-meeting-overlay" onClick={() => setCreateModal(false)}>
      <motion.div
        className="gsea-meeting-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
      >
        <div className="gsea-meeting-left">
          <div className="gsea-task-drawer-header">
            <h2>Programar Reunión</h2>
            <button onClick={() => setCreateModal(false)}>
              <X size={22} />
            </button>
          </div>

          <div className="gsea-task-tabs">
            <button className="active">Configuración</button>
          </div>

          <div className="gsea-task-body">
            <div className="gsea-meeting-row-2">
              <div className="gsea-task-row single">
                <label>Título</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Título de la reunión"
                />
              </div>

              <div className="gsea-task-row single">
                <label>Prioridad</label>
                <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>

            <div className="gsea-task-row single">
              <label>Cliente / invitado</label>
              <select
                value={newCliente?.id || ""}
                onChange={(e) => {
                  const cliente = CLIENTES_DATA.find(c => c.id === parseInt(e.target.value));
                  setNewCliente(cliente);
                }}
              >
                <option value="">Seleccionar cliente</option>
                {CLIENTES_DATA.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} · {c.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="gsea-task-row single">
              <label>Correo invitado</label>
              <input
                type="email"
                value={newCliente?.email || ""}
                placeholder="cliente@gmail.com"
                readOnly
              />
            </div>

            <div className="gsea-meeting-date-grid">
              <div className="gsea-task-row single">
                <label>Fecha</label>
                <input
                  type="datetime-local"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
            </div>

            <div className="gsea-meeting-row-2">
              <div className="gsea-task-row single">
                <label>Canal</label>
                <select value="google_meet" disabled>
                  <option value="google_meet">Google Meet</option>
                </select>
              </div>
            </div>

            <div className="gsea-meet-info">
              <Calendar size={16} />
              <span>Se creará automáticamente un enlace de Google Meet y se enviará la invitación al correo del cliente.</span>
            </div>

            <div className="gsea-task-row single">
              <label>Descripción</label>
              <textarea rows="5" placeholder="Agrega una descripción..." />
            </div>
          </div>
        </div>

        <div className="gsea-meeting-right">
          <h2>Semana 26, Junio 2026</h2>
          <div className="gsea-meeting-calendar-fake">
            <div className="gsea-meeting-calendar-toolbar">
              <button>Día</button>
              <button className="active">Semana</button>
              <button>Mes</button>
              <button>Año</button>
              <button>Agenda</button>
            </div>

            <div className="gsea-meeting-calendar-box">
              <FullCalendar
                key={newDate ? newDate.slice(0, 10) : "meeting-preview"}
                plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                initialDate={newDate ? newDate.slice(0, 10) : new Date()}
                events={meetingPreviewEvents}
                height="100%"
                locale={esLocale}
                timeZone="local"
                headerToolbar={false}
                allDaySlot={false}
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                slotDuration="00:30:00"
                eventTimeFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }}
              />
            </div>
          </div>
        </div>

        <div className="gsea-task-footer gsea-meeting-footer">
          <button className="gsea-related-btn">
            Relacionado con <strong>0</strong>
          </button>

          <div>
            <button className="gsea-task-cancel" onClick={() => setCreateModal(false)}>
              Cancelar
            </button>

            <button
              className="gsea-task-save"
              onClick={createEvent}
              disabled={!newDate || !newCliente}
            >
              Guardar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>

      {/* Modal de Chat */}
      <AnimatePresence>
        {chatModal && (
          <div className="cobranza-modal-overlay" onClick={() => setChatModal(false)}>
            <motion.div
              className="cobranza-modal cobranza-modal-chat"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <div className="cobranza-modal-header">
                <div className="cobranza-modal-icon">
                  <MessageSquare size={24} />
                </div>
                <h2 className="cobranza-modal-title">Chat Inteligente</h2>
                <button className="cobranza-modal-close" onClick={() => setChatModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="cobranza-chat-container">
                <div className="cobranza-chat-sidebar">
                  <div className="cobranza-chat-search">
                    <input type="text" placeholder="Buscar cliente..." />
                  </div>
                  <div className="cobranza-chat-list">
                    {CLIENTES_DATA.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setActiveChat(c)}
                        className={`cobranza-chat-item ${activeChat?.id === c.id ? 'active' : ''}`}
                      >
                        <div className="cobranza-chat-avatar">
                          {c.inicial}
                        </div>
                        <div className="cobranza-chat-info">
                          <p className="cobranza-chat-name">{c.nombre}</p>
                          <p className="cobranza-chat-preview">{c.poliza}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="cobranza-chat-main">
                  {activeChat ? (
                    <>
                      <div className="cobranza-chat-header">
                        <div className="cobranza-chat-user">
                          <div className="cobranza-chat-avatar large">
                            {activeChat.inicial}
                          </div>
                          <div>
                            <p className="cobranza-chat-name large">{activeChat.nombre}</p>
                            <p className="cobranza-chat-detail">{activeChat.poliza} • {activeChat.monto}</p>
                          </div>
                        </div>
                      </div>

                      <div className="cobranza-chat-messages">
                        {(chats[activeChat.id] || []).map((msg, i) => (
                          <div
                            key={i}
                            className={`cobranza-chat-message ${msg.from === 'agente' ? 'agent' : 'client'}`}
                          >
                            <div className="cobranza-message-content">
                              {msg.text}
                            </div>
                            <div className="cobranza-message-time">{msg.time}</div>
                          </div>
                        ))}
                      </div>

                      <div className="cobranza-chat-input">
                        <input
                          type="text"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Escribe un mensaje..."
                          onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={sendChatMessage}
                          className="cobranza-chat-send"
                        >
                          <Send size={18} />
                        </motion.button>
                      </div>
                    </>
                  ) : (
                    <div className="cobranza-chat-empty">
                      <MessageSquare size={50} />
                      <p>Selecciona un chat para comenzar</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}