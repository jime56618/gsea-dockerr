import React, { useEffect, useMemo, useState } from "react";
import "./css/Dashboard.css";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { persistWorkspaceFromUser } from "../utils/workspaceStorage";
import { TOKEN_KEY } from "../utils/constants";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { animate, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BadgeDollarSign,
  CalendarDays,
  Clock,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const EMPTY_DASHBOARD = {
  kpis: {
    clientes_total: 0,
    polizas_vendidas: 0,
    prima_mensual: 0,
    tasa_renovacion: 0,
    polizas_vencidas: 0,
  },
  objetivo: { current: 0, target: 0, progress_pct: 0 },
  charts: {
    ventas_mensuales: [],
    distribucion_polizas: [],
    polizas_por_ramo: [],
    cartera_por_aseguradora: [],
  },
  cobranza: {
    pagada: { cantidad: 0, monto: 0 },
    pendiente: { cantidad: 0, monto: 0 },
    vencida: { cantidad: 0, monto: 0 },
  },
  tramites: { total: 0, atencion: 0, por_etapa: [], por_semaforo: [] },
  operativa: {
    acciones_urgentes: [],
    cobros_pendientes: [],
    polizas_vencidas: [],
    eventos_proximos: [],
  },
};

const POLICY_COLORS = ["#00B867", "#E36A73", "#00529B", "#D6A21E"];
const COLLECTION_COLORS = ["#00B867", "#D6A21E", "#E36A73"];
const ACTION_ROUTES = {
  cobro: "/seguimiento-cobranza",
  poliza: "/seguimiento-polizas",
  tramite: "/tramites",
  evento: "/calendario",
};

function authHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function formatTodayLabel() {
  return new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function money(value) {
  return Number(value || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}

function number(value) {
  return Number(value || 0).toLocaleString("es-MX");
}

function Counter({ value, isCurrency = false, isPercent = false }) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = Number(value || 0);

  useEffect(() => {
    const controls = animate(0, numericValue, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: setDisplayValue,
    });
    return () => controls.stop();
  }, [numericValue]);

  return (
    <span>
      {isCurrency ? "$" : ""}
      {Math.round(displayValue).toLocaleString("es-MX")}
      {isPercent ? "%" : ""}
    </span>
  );
}

function actionType(item, fallback) {
  const type = String(item?.type || fallback || "").toLowerCase();
  if (type.includes("cobro") || type.includes("pago") || type.includes("mora")) return "cobro";
  if (type.includes("poliza") || type.includes("venc") || type.includes("renov")) return "poliza";
  if (type.includes("tram")) return "tramite";
  if (type.includes("event") || type.includes("tarea") || type.includes("calend")) return "evento";
  if (item?.cuota_id) return "cobro";
  if (item?.poliza_id) return "poliza";
  if (item?.tramite_id) return "tramite";
  if (item?.event_id) return "evento";
  return fallback;
}

function getActionTitle(item, type) {
  return item?.title || item?.name || item?.client || item?.detail || {
    cobro: "Cobro pendiente",
    poliza: "Póliza por atender",
    tramite: "Trámite pendiente",
    evento: "Evento próximo",
  }[type];
}

function getActionDetail(item) {
  return item?.detail || item?.client || item?.description || item?.time || "Requiere revisión";
}

function getActionId(item, type) {
  return item?.cuota_id || item?.poliza_id || item?.tramite_id || item?.event_id || item?.id
    ? `${type}-${item.cuota_id || item.poliza_id || item.tramite_id || item.event_id || item.id}`
    : undefined;
}

function buildActionGroups(operativa) {
  const groups = [
    ["Urgentes", "acciones_urgentes", null],
    ["Cobranza", "cobros_pendientes", "cobro"],
    ["Pólizas", "polizas_vencidas", "poliza"],
    ["Eventos", "eventos_proximos", "evento"],
  ];

  return groups.map(([label, key, fallback]) => ({
    label,
    actions: (Array.isArray(operativa?.[key]) ? operativa[key] : [])
      .slice(0, 2)
      .map((item, index) => {
        const type = actionType(item, fallback);
        return {
          item,
          type,
          key: getActionId(item, type) || `${key}-${index}`,
        };
      }),
  }));
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchUserAndDashboard = async () => {
      setLoadingDashboard(true);
      setDashboardError("");
      try {
        const [userRes, dashboardRes] = await Promise.all([
          fetch(`${API_URL}/user`, { headers: authHeaders() }),
          fetch(`${API_URL}/dashboard/summary`, { headers: authHeaders() }),
        ]);
        const userData = await userRes.json().catch(() => null);
        const dashboardData = await dashboardRes.json().catch(() => null);

        if (!active) return;
        if (userRes.ok && userData) {
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          persistWorkspaceFromUser(userData);
        }
        if (!dashboardRes.ok || !dashboardData) {
          throw new Error(dashboardData?.message || "No se pudo cargar el resumen.");
        }
        setDashboard({ ...EMPTY_DASHBOARD, ...dashboardData });
      } catch (error) {
        if (!active) return;
        console.error("Error cargando dashboard:", error);
        setDashboard(EMPTY_DASHBOARD);
        setDashboardError(error.message || "No se pudo cargar el dashboard.");
      } finally {
        if (active) setLoadingDashboard(false);
      }
    };

    fetchUserAndDashboard();
    return () => {
      active = false;
    };
  }, []);

  const charts = dashboard.charts || EMPTY_DASHBOARD.charts;
  const ventasData = Array.isArray(charts.ventas_mensuales) ? charts.ventas_mensuales : [];
  const distribucionPolizas = Array.isArray(charts.distribucion_polizas)
    ? charts.distribucion_polizas
    : [];
  const ramosData = Array.isArray(charts.polizas_por_ramo) ? charts.polizas_por_ramo : [];
  const aseguradorasData = Array.isArray(charts.cartera_por_aseguradora)
    ? charts.cartera_por_aseguradora
    : [];
  const cobranza = dashboard.cobranza || EMPTY_DASHBOARD.cobranza;
  const tramites = dashboard.tramites || EMPTY_DASHBOARD.tramites;
  const actionGroups = useMemo(() => buildActionGroups(dashboard.operativa), [dashboard.operativa]);
  const progress = Math.min(Math.max(Number(dashboard.objetivo?.progress_pct || 0), 0), 100);
  const greetingUser = authUser || user;
  const greetingName =
    greetingUser?.name ||
    greetingUser?.nombre ||
    [greetingUser?.first_name, greetingUser?.last_name].filter(Boolean).join(" ") ||
    "bienvenido";

  const handleAction = (action) => {
    const route = ACTION_ROUTES[action.type];
    if (route) {
      navigate(route, {
        state: {
          cuotaId: action.item?.cuota_id,
          polizaId: action.item?.poliza_id,
          tramiteId: action.item?.tramite_id,
          eventId: action.item?.event_id,
        },
      });
    }
  };

  return (
    <div className="gsea-dashboard-page">
      <Sidebar onExpand={setIsSidebarExpanded} />
      <main
        className="gsea-dashboard-main"
        style={{ "--gsea-sidebar-width": isSidebarExpanded ? "248px" : "72px" }}
      >
        <Navbar />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="gsea-dashboard-content"
        >
          <header className="gsea-dashboard-heading">
            <div>
              <p>Centro operativo</p>
              <h1>Hola, {greetingName}</h1>
              <span><Clock size={14} />{formatTodayLabel()}</span>
            </div>
            <div className="gsea-period-chip"><CalendarDays size={15} />Mes actual</div>
          </header>

          {dashboardError && <div className="gsea-dashboard-error" role="alert">{dashboardError}</div>}

          <section className="gsea-kpi-row">
            <Metric title="Clientes totales" value={dashboard.kpis.clientes_total} icon={Users} trend="En vivo" />
            <Metric title="Pólizas vendidas" value={dashboard.kpis.polizas_vendidas} icon={ShieldCheck} trend="En vivo" />
            <Metric title="Prima mensual" value={dashboard.kpis.prima_mensual} icon={BadgeDollarSign} trend="Actual" isCurrency />
            <Metric title="Tasa de renovación" value={dashboard.kpis.tasa_renovacion} icon={TrendingUp} trend="Actual" isPercent />
            <Metric title="Pólizas vencidas" value={dashboard.kpis.polizas_vencidas} icon={AlertCircle} trend="Atención" isAlert />
          </section>

          <section className="gsea-dashboard-grid gsea-dashboard-grid--primary">
            <article className="gsea-panel gsea-panel-activity">
              <PanelHeader eyebrow="Prioridad" title="Operativa diaria" description="Registros reales que requieren atención." />
              <div className="gsea-operation-list">
                {loadingDashboard && <EmptyState text="Cargando acciones..." />}
                {!loadingDashboard && actionGroups.every((group) => !group.actions.length) && (
                  <EmptyState text="No hay acciones pendientes." />
                )}
                {!loadingDashboard && actionGroups.map((group) => (
                  <div className="gsea-operation-group" key={group.label}>
                    <div className="gsea-operation-group__label">
                      <span>{group.label}</span>
                      <small>{group.actions.length ? `${group.actions.length} pendientes` : "Sin pendientes"}</small>
                    </div>
                    {group.actions.length ? group.actions.map(({ item, type, key }) => (
                      <button
                        type="button"
                        className={`gsea-action-row is-${type || "info"}`}
                        key={key}
                        disabled={!ACTION_ROUTES[type]}
                        onClick={() => handleAction({ item, type })}
                      >
                        <i />
                        <span className="gsea-action-row__body">
                          <strong>{getActionTitle(item, type)}</strong>
                          <small>{getActionDetail(item)}</small>
                        </span>
                        <em>{item?.tag || item?.time || "Ver"}</em>
                      </button>
                    )) : (
                      <div className="gsea-operation-group__empty">No hay registros</div>
                    )}
                  </div>
                ))}
              </div>
            </article>

            <article className="gsea-panel gsea-panel-line">
              <PanelHeader eyebrow="Rendimiento" title="Ventas mensuales" description="Evolución de prima del periodo." />
              {ventasData.length ? (
                <div className="gsea-line-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ventasData} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="#E9EDF4" strokeDasharray="4 5" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#8B95A7" }} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => value >= 1000 ? `${Math.round(value / 1000)}k` : value} tick={{ fontSize: 10, fill: "#A3ABB8" }} />
                      <Tooltip content={<MoneyTooltip />} />
                      <Line type="monotoneX" dataKey="ventas" stroke="#00529B" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "#fff", stroke: "#00529B", strokeWidth: 2.5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : <EmptyState text="No hay información disponible para este periodo." />}
            </article>
          </section>

          <section className="gsea-dashboard-grid gsea-dashboard-grid--secondary">
            <article className="gsea-panel">
              <PanelHeader eyebrow="Composición" title="Pólizas por ramo" description="Distribución real de la cartera." />
              {ramosData.length ? (
                <div className="gsea-horizontal-chart">
                  <ResponsiveContainer width="100%" height={Math.max(210, ramosData.length * 38)}>
                    <BarChart data={ramosData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                      <CartesianGrid horizontal={false} stroke="#EDF0F4" />
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={105} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#5B5D5E" }} />
                      <Tooltip content={<CountTooltip />} />
                      <Bar dataKey="value" fill="#00529B" radius={[0, 7, 7, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <EmptyState text="No hay ramos disponibles." />}
            </article>

            <article className="gsea-panel">
              <PanelHeader eyebrow="Cartera" title="Estado de pólizas" description="Distribución actual." />
              {distribucionPolizas.length ? <PolicyDistribution data={distribucionPolizas} /> : <EmptyState text="No hay información de pólizas." />}
            </article>
          </section>

          <section className="gsea-dashboard-grid gsea-dashboard-grid--tertiary">
            <CollectionPanel cobranza={cobranza} />
            <article className="gsea-panel">
              <PanelHeader eyebrow="Aseguradoras" title="Cartera por aseguradora" description="Pólizas y prima total por compañía." />
              {aseguradorasData.length ? (
                <div className="gsea-insurer-list">
                  {aseguradorasData.map((item) => (
                    <div className="gsea-insurer-row" key={item.aseguradora_id || item.name}>
                      <span>{item.name}</span>
                      <strong>{number(item.polizas)}</strong>
                      <small>{money(item.prima_total)}</small>
                    </div>
                  ))}
                </div>
              ) : <EmptyState text="No hay aseguradoras disponibles." />}
            </article>
          </section>

          <section className="gsea-dashboard-grid gsea-dashboard-grid--tertiary">
            <article className="gsea-panel">
              <PanelHeader eyebrow="Seguimiento" title="Estado de trámites" description={`${number(tramites.atencion)} requieren atención de ${number(tramites.total)}.`} />
              <div className="gsea-tramites-summary">
                <strong>{number(tramites.atencion)}</strong><span>En atención</span>
              </div>
              {(Array.isArray(tramites.por_semaforo) && tramites.por_semaforo.length
                ? tramites.por_semaforo
                : tramites.por_etapa || []
              ).length ? (
                <div className="gsea-status-list">
                  {(Array.isArray(tramites.por_semaforo) && tramites.por_semaforo.length
                    ? tramites.por_semaforo
                    : tramites.por_etapa || []
                  ).map((item) => (
                    <div key={item.name} className="gsea-status-row"><span>{item.name}</span><strong>{number(item.value)}</strong></div>
                  ))}
                </div>
              ) : <EmptyState text="No hay trámites disponibles." />}
            </article>
            <article className="gsea-panel gsea-panel-goal">
              <PanelHeader eyebrow="Objetivo" title="Avance comercial" description="Progreso reportado por el resumen." />
              <div className="gsea-goal-value"><strong>{money(dashboard.objetivo?.current)}</strong><span>de {money(dashboard.objetivo?.target)}</span></div>
              <div className="gsea-goal-track"><i style={{ width: `${progress}%` }} /></div>
              <div className="gsea-goal-percent"><span>Avance</span><strong>{progress}%</strong></div>
              
            </article>
          </section>
        </motion.div>
      </main>
    </div>
  );
}

function Metric({ title, value, icon: Icon, trend, isAlert = false, isCurrency = false, isPercent = false }) {
  return (
    <motion.article whileHover={{ y: -2 }} className={`gsea-metric ${isAlert ? "is-alert" : ""}`}>
      <div className="gsea-metric__top"><span className="gsea-metric__icon"><Icon size={16} /></span><span className="gsea-metric__trend">{isAlert ? <ArrowDownRight size={10} /> : <ArrowUpRight size={10} />}{trend}</span></div>
      <p>{title}</p>
      <strong><Counter value={value} isCurrency={isCurrency} isPercent={isPercent} /></strong>
    </motion.article>
  );
}

function PanelHeader({ eyebrow, title, description }) {
  return <div className="gsea-panel-header"><div><p>{eyebrow}</p><h2>{title}</h2><span>{description}</span></div></div>;
}

function EmptyState({ text }) {
  return <div className="gsea-empty-state"><span>{text}</span></div>;
}

function MoneyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return <div className="gsea-tooltip"><span>{label || "Periodo"}</span><strong>{money(payload[0].value)}</strong></div>;
}

function CountTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return <div className="gsea-tooltip"><span>{label}</span><strong>{number(payload[0].value)} pólizas</strong></div>;
}

function PolicyDistribution({ data }) {
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);
  return (
    <div className="gsea-policy-layout">
      <div className="gsea-policy-chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius="62%" outerRadius="84%" paddingAngle={3} stroke="none">
              {data.map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={POLICY_COLORS[index % POLICY_COLORS.length]} />)}
            </Pie>
            <Tooltip content={<CountTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="gsea-policy-center"><strong>{number(total)}</strong><span>Total</span></div>
      </div>
      <div className="gsea-policy-legend">
        {data.map((item, index) => <div key={item.name}><i style={{ background: POLICY_COLORS[index % POLICY_COLORS.length] }} /><span>{item.name}</span><strong>{number(item.value)}</strong></div>)}
      </div>
    </div>
  );
}

function CollectionPanel({ cobranza }) {
  const rows = [
    ["Pagada", cobranza.pagada, COLLECTION_COLORS[0]],
    ["Pendiente", cobranza.pendiente, COLLECTION_COLORS[1]],
    ["Vencida", cobranza.vencida, COLLECTION_COLORS[2]],
  ];
  return (
    <article className="gsea-panel">
      <PanelHeader eyebrow="Cobranza" title="Estado de cobranza" description="Cuotas y montos reportados." />
      <div className="gsea-collection-list">
        {rows.map(([label, item, color]) => <div className={`gsea-collection-row ${label === "Vencida" ? "is-danger" : ""}`} key={label}><i style={{ background: color }} /><div><span>{label}</span><strong>{money(item?.monto)}</strong></div><small>{number(item?.cantidad)} cuotas</small></div>)}
      </div>
    </article>
  );
}
