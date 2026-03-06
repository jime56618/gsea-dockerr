import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Settings, X, Bug, UserPlus, 
  Moon, Languages, Smartphone, ChevronRight,
  CreditCard, Box, Camera, ShieldCheck
} from 'lucide-react';

// --- SUB-COMPONENTES AUXILIARES ---

function NotificationItem({ icon, title, time }) {
  return (
    <div className="flex items-start gap-3 p-1">
      <div className="mt-0.5 w-7 h-7 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100 shadow-sm text-slate-500">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-700 font-medium leading-tight">{title}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

function ActivityItem({ img, title, time }) {
  return (
    <div className="flex items-start gap-3 pb-6 relative">
      <div className="z-10 -ml-[13px] w-6 h-6 rounded-full border-2 border-white overflow-hidden shadow-sm bg-white">
        <img src={img} className="w-full h-full object-cover" alt="activity" />
      </div>
      <div className="flex flex-col">
        <p className="text-sm text-slate-700 font-medium leading-tight">{title}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

function SettingRow({ icon, title, subtitle, action }) {
  return (
    <div className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
      <div className="flex items-center gap-3">
        <div className="text-slate-400">{icon}</div>
        <div>
          <p className="text-sm font-bold text-slate-700 leading-tight">{title}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function ModuleRow({ icon, title, subtitle, badge, color }) {
  return (
    <div className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400 group-hover:text-[#1E488F] transition-colors">{icon}</div>
        <div>
          <p className="text-sm font-bold text-slate-700 leading-tight">{title}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${color}`}>{badge}</span>
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---

export default function UserNavbar() {
  const [activePanel, setActivePanel] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const [userData, setUserData] = useState({
    name: 'Ferra Alexandra',
    role: 'Admin Store',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256'
  });

  const togglePanel = (panelName) => setActivePanel(activePanel === panelName ? null : panelName);

  return (
    /* pt-8 para bajarla del borde superior y px-8 para alinearla lateralmente con el contenido */
    <div className="flex justify-end items-center gap-3 pt-8 px-8 mb-10 relative">
      
      {/* Botón Configuración */}
      <button 
        onClick={() => togglePanel('settings')} 
        className={`p-2.5 rounded-full shadow-sm border transition-all ${activePanel === 'settings' ? 'bg-[#1E488F] text-white' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
      >
        <Settings size={20} />
      </button>

      {/* Botón Notificaciones */}
      <button 
        onClick={() => togglePanel('notifications')} 
        className={`relative p-2.5 rounded-full shadow-sm border transition-all ${activePanel === 'notifications' ? 'bg-[#1E488F] text-white' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
      >
        <Bell size={20} />
        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white"></span>
      </button>

      {/* Perfil en el Header */}
      <div 
        className="flex items-center gap-3 ml-2 cursor-pointer group bg-white/40 py-1 pl-1 pr-3 rounded-full border border-transparent hover:border-slate-100 hover:bg-white transition-all shadow-sm" 
        onClick={() => togglePanel('profile')}
      >
        <div className={`w-10 h-10 rounded-full border-2 shadow-sm overflow-hidden transition-all ${activePanel === 'profile' ? 'border-[#1E488F] scale-105' : 'border-white'}`}>
          <img src={userData.avatar} alt="Profile" className="w-full h-full object-cover" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-bold text-[#001F3F] leading-none group-hover:text-[#1E488F] transition-colors">{userData.name}</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{userData.role}</p>
        </div>
      </div>

      {/* MODAL EDITAR PERFIL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-[#001F3F]/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#001F3F]">Configurar Perfil</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
              </div>
              <div className="space-y-6">
                <div className="relative w-24 h-24 mx-auto">
                  <img src={userData.avatar} className="w-full h-full rounded-full object-cover border-4 border-slate-50" />
                  <div className="absolute bottom-0 right-0 p-2 bg-[#1E488F] text-white rounded-full cursor-pointer shadow-lg"><Camera size={14} /></div>
                </div>
                <div className="space-y-4">
                  <input type="text" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-medium outline-none focus:border-[#1E488F]" placeholder="Nombre" />
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="w-full py-4 bg-[#1E488F] text-white rounded-2xl font-bold hover:shadow-lg transition-all">Guardar Cambios</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PANEL LATERAL */}
      <AnimatePresence>
        {activePanel && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActivePanel(null)} className="fixed inset-0 z-[100] bg-black/5 backdrop-blur-[1px]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-[105] border-l p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-bold text-[#001F3F]">{activePanel === 'profile' ? 'Cuenta' : activePanel === 'notifications' ? 'Actividad' : 'Configuración'}</h2>
                <button onClick={() => setActivePanel(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
              </div>

              {/* PERFIL */}
              {activePanel === 'profile' && (
                <div className="space-y-8">
                  <button onClick={() => setIsEditModalOpen(true)} className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#1E488F]/30 transition-all text-left group">
                    <img src={userData.avatar} className="w-14 h-14 rounded-full border-2 border-white shadow-sm" />
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-slate-800">{userData.name}</h3>
                      <p className="text-[11px] text-slate-500 font-medium">ID: #8823 • Enterprise</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </button>
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Módulos Activos</h3>
                    <div className="space-y-2">
                      <ModuleRow icon={<CreditCard size={18} />} title="Suscripción" subtitle="Plan Pro" badge="Activo" color="text-green-600 bg-green-50" />
                      <ModuleRow icon={<Box size={18} />} title="CRM GSEA" subtitle="v2.4" badge="Update" color="text-blue-600 bg-blue-50" />
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICACIONES */}
              {activePanel === 'notifications' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Recientes</h3>
                    <div className="space-y-5">
                      <NotificationItem icon={<Bug size={14}/>} title="Bug corregido en API" time="Ahora" />
                      <NotificationItem icon={<UserPlus size={14}/>} title="Nuevo usuario registrado" time="Hace 10m" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Línea de Tiempo</h3>
                    <div className="ml-3 border-l-2 border-slate-50 space-y-0">
                      <ActivityItem img="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64" title="Diseño actualizado" time="12:30 PM" />
                      <ActivityItem img="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64" title="Check-in sistema" time="Ayer" />
                    </div>
                  </div>
                </div>
              )}

              {/* CONFIGURACIÓN */}
              {activePanel === 'settings' && (
                <div className="space-y-2">
                  <SettingRow icon={<Moon size={18}/>} title="Modo Nocturno" subtitle="Ahorro de batería" action={<button onClick={() => setDarkMode(!darkMode)} className={`w-9 h-5 rounded-full relative transition-colors ${darkMode ? 'bg-blue-600' : 'bg-slate-200'}`}><div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${darkMode ? 'right-1' : 'left-1'}`} /></button>} />
                  <SettingRow icon={<Languages size={18}/>} title="Idioma" subtitle="Español (ES)" action={<span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">ES</span>} />
                  <SettingRow icon={<Smartphone size={18}/>} title="App Móvil" subtitle="Vincular dispositivo" action={<ChevronRight size={16} className="text-slate-300"/>} />
                  <SettingRow icon={<ShieldCheck size={18}/>} title="Seguridad" subtitle="2FA Activo" action={<div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>} />
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}