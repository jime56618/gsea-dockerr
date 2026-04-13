import React, { useState, useEffect } from 'react';
import './css/Dashboard.css';
import Sidebar from './Sidebar';
import Navbar from './Navbar'; 
import { motion, animate } from 'framer-motion'; 
import { 
  Users, ShieldCheck, BadgeDollarSign, TrendingUp, 
  CalendarClock, AlertCircle, Clock, FileWarning,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, XAxis, CartesianGrid
} from 'recharts';

const COLORS = ['#DBE64C', '#f87171', '#1E488F'];
const dataVentas = [
  { name: 'Ene', ventas: 400 },
  { name: 'Feb', ventas: 700 },
  { name: 'Mar', ventas: 500 },
  { name: 'Abr', ventas: 900 },
  { name: 'May', ventas: 1100 },
];

function Counter({ value, isCurrency = false, isPercent = false }) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[$,%]/g, '')) : value;

  useEffect(() => {
    const controls = animate(0, numericValue, {
      duration: 2,
      onUpdate: (val) => setDisplayValue(val),
      ease: "easeOut"
    });
    return () => controls.stop();
  }, [numericValue]);

  
  return (
    <span>
      {isCurrency && "$"}
      {Math.floor(displayValue).toLocaleString()}
      {isPercent && "%"}
    </span>
  );
}

export default function Dashboard() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [user, setUser] = useState(() => {
  const stored = localStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
});

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:8000/api/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });

      const data = await res.json();

      // 🔥 actualiza estado y localStorage
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));

    } catch (error) {
      console.error('Error actualizando user:', error);
    }
  };

  fetchUser();
}, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#f1f4f9] font-inter overflow-x-hidden">
      
      <Sidebar onExpand={setIsSidebarExpanded} />

      <main 
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? 'ml-[260px]' : 'ml-[70px]'
        }`}
      >
        <Navbar />

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 lg:p-10 max-w-[1600px] w-full mx-auto"
        >
          <header className="mb-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl lg:text-5xl font-black text-[#001F3F] tracking-tight leading-tight">
                Welcome back, {user?.name || ''}!
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 mt-3"
            >
              <div className="h-6 w-1 bg-[#1E488F] rounded-full"></div>
              <p className="text-gray-500 font-medium flex items-center gap-2 text-sm lg:text-base">
                <Clock size={16} className="text-[#1E488F]" />
                Tu día empieza ahora — Jueves, 26 Oct
              </p>
            </motion.div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
            <StatCard title="Clientes Totales" value="1452" icon={Users} color="bg-[#AED0C9]" trend="+8%" />
            <StatCard title="Pólizas Vendidas" value="85" icon={ShieldCheck} color="bg-[#DBE64C]" trend="+15%" />
            <StatCard title="Prima Mensual" value="14500" icon={BadgeDollarSign} color="bg-[#1E488F]" trend="-3%" isNegative isCurrency />
            <StatCard title="Tasa Renovación" value="88" icon={TrendingUp} color="bg-purple-500" trend="+2%" isPercent />
            <StatCard title="Pólizas Vencidas" value="18" icon={AlertCircle} color="bg-red-500" trend="CRÍTICO" isAlert />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-8 space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/80 backdrop-blur-sm p-6 lg:p-8 rounded-3xl shadow-lg border border-white/50"
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-lg font-black text-[#001F3F]">Análisis de Rendimiento</h3>
                    <p className="text-xs text-gray-400 mt-1">Distribución y tendencia mensual</p>
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    Resumen Operativo
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="h-[280px] transform transition-transform hover:scale-[1.02] duration-300">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={[{ name: 'Activas', value: 60 }, { name: 'Vencidas', value: 15 }, { name: 'Pendientes', value: 25 }]} 
                          innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none"
                        >
                          {COLORS.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            background: 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(8px)'
                          }} 
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          iconType="circle" 
                          wrapperStyle={{ paddingTop: '20px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-[280px] transform transition-transform hover:scale-[1.02] duration-300">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dataVentas}>
                        <defs>
                          <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#DBE64C" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#DBE64C" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 11, fill: '#94a3b8'}} 
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            background: 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(8px)'
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="ventas" 
                          stroke="#DBE64C" 
                          strokeWidth={3} 
                          fill="url(#colorV)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/50"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-black text-[#001F3F]">Ventas vs Meta Mensual</h3>
                    <p className="text-xs text-gray-400 mt-1">Progreso acumulado del período</p>
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-4 py-2 rounded-full shadow-sm">
                    Meta: $20,000
                  </span>
                </div>
                <div className="h-[200px] w-full transform transition-transform hover:scale-[1.01] duration-300">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dataVentas}>
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: 'none', 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          background: 'rgba(255,255,255,0.9)',
                          backdropFilter: 'blur(8px)'
                        }} 
                      />
                      <Area 
                        type="step" 
                        dataKey="ventas" 
                        stroke="#1E488F" 
                        fill="#1E488F" 
                        fillOpacity={0.08} 
                        strokeWidth={2.5} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/50"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-gradient-to-br from-[#1E488F]/10 to-[#1E488F]/5 rounded-xl">
                    <CalendarClock className="text-[#1E488F]" size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-[#001F3F]">Operativa Diaria</h3>
                    <p className="text-xs text-gray-400">Actividad del día</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#DBE64C]"></div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Cobros Pendientes
                      </p>
                    </div>
                    <ActivityItem name="Juan Pérez" detail="Auto #E234 - $250" time="Hoy" type="cobro" />
                    <ActivityItem name="Pedro Ruiz" detail="Hogar #V552 - $80" time="Vencido" type="mora" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse"></div>
                      <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1">
                        <FileWarning size={12} /> Acciones Urgentes
                      </p>
                    </div>
                    <UrgentItem title="Renovar Póliza #E234" client="Nadia R." tag="30 días" />
                    <UrgentItem title="Cargar Documentación" client="Luis M." tag="Pendiente" isAlert />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-br from-[#001F3F] to-[#002b5e] p-8 rounded-3xl shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAgMzBhMzAgMzAgMCAwIDEgMzAgMzAgMzAgMzAgMCAwIDEtNjAgMCAzMCAzMCAwIDAgMSAzMC0zMHoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-20"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-blue-200/80 font-bold text-xs uppercase tracking-[0.2em]">
                      Objetivo Q1
                    </h3>
                    <span className="text-blue-200/40 text-[10px] font-medium">
                      Progreso actual
                    </span>
                  </div>
                  <div className="flex items-end justify-between mb-4">
                    <span className="text-4xl font-black text-[#DBE64C] tracking-tight">
                      $18,300
                    </span>
                    <span className="text-white/40 text-xs font-medium mb-1">
                      Target: $25k
                    </span>
                  </div>
                  <div className="relative mb-3">
                    <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '73%' }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="bg-gradient-to-r from-[#DBE64C] to-[#f5ff8c] h-full rounded-full shadow-[0_0_20px_rgba(219,230,76,0.3)]" 
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-blue-100/40 text-[10px] font-medium uppercase tracking-wider">
                      73% completado
                    </p>
                    <div className="flex gap-1">
                      <div className="h-1 w-1 rounded-full bg-[#DBE64C]/50"></div>
                      <div className="h-1 w-1 rounded-full bg-[#DBE64C]/30"></div>
                      <div className="h-1 w-1 rounded-full bg-[#DBE64C]/10"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#DBE64C]/5 rounded-full blur-3xl pointer-events-none"></div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, trend, isNegative, isAlert, isCurrency, isPercent }) {
  return (
    <motion.div 
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`p-5 rounded-2xl shadow-lg backdrop-blur-sm transition-all ${
        isAlert 
          ? 'bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200/50' 
          : 'bg-white/80 border border-white/50 hover:shadow-xl'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">{title}</h3>
        <span className={`text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1 ${
          isAlert 
            ? 'bg-red-600 text-white' 
            : isNegative 
              ? 'bg-orange-100 text-orange-600' 
              : 'bg-emerald-100 text-emerald-600'
        }`}>
          {!isAlert && (isNegative ? <ArrowDownRight size={10} /> : <ArrowUpRight size={10} />)}
          {trend}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <p className={`text-2xl font-black tracking-tight ${
          isAlert ? 'text-red-700' : 'text-[#001F3F]'
        }`}>
          <Counter value={value} isCurrency={isCurrency} isPercent={isPercent} />
        </p>
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} bg-opacity-10 shadow-sm`}>
          <Icon size={20} className={isAlert ? 'text-red-600' : 'text-[#001F3F]'} />
        </div>
      </div>
    </motion.div>
  );
}

function ActivityItem({ name, detail, time, type }) {
  return (
    <motion.div 
      whileHover={{ x: 4 }}
      className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50/50 to-white rounded-xl border border-gray-100/80 hover:border-gray-200 transition-all hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className={`w-1 h-8 rounded-full ${type === 'mora' ? 'bg-red-400' : 'bg-[#DBE64C]'}`} />
        <div>
          <p className="font-bold text-[#001F3F] text-sm">{name}</p>
          <p className="text-[10px] text-gray-400 font-medium">{detail}</p>
        </div>
      </div>
      <span className={`text-[9px] font-black px-2 py-1 rounded-md ${
        type === 'mora' 
          ? 'bg-red-100 text-red-600' 
          : 'bg-[#DBE64C]/10 text-[#1E488F]'
      }`}>
        {time}
      </span>
    </motion.div>
  );
}

function UrgentItem({ title, client, tag, isAlert }) {
  return (
    <motion.div 
      whileHover={{ x: 4 }}
      className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:shadow-md ${
        isAlert 
          ? 'bg-gradient-to-r from-red-50 to-red-50/30 border-red-200/50' 
          : 'bg-white border-gray-100/80 hover:border-gray-200'
      }`}
    >
      <div>
        <p className="text-[10px] font-black text-[#001F3F] leading-tight">{title}</p>
        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{client}</p>
      </div>
      <span className={`text-[8px] font-black px-2 py-1 rounded-md ${
        isAlert 
          ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-sm' 
          : 'bg-orange-100 text-orange-600'
      }`}>
        {tag}
      </span>
    </motion.div>
  );
}