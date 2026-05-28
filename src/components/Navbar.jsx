import React, { useState, useEffect } from 'react';
import { persistWorkspaceFromUser } from '../utils/workspaceStorage';
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
  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState({
    name: '',
    avatar: '',
    avatarFile: null
  });

  const togglePanel = (panel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  // 🔥 GET USER
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token'); // ✅ corregido

        const res = await fetch('http://localhost:8000/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          }
        });

        const data = await res.json();

        setUserData({
          ...data,
          avatarFile: null
        });

        localStorage.setItem('user', JSON.stringify(data));
        persistWorkspaceFromUser(data);
        setLoading(false);

      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  // 🔥 IMAGE CHANGE
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setUserData({
        ...userData,
        avatarFile: file
      });
    }
  };

  // 🔥 SAVE PROFILE
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');

      const formData = new FormData();
      formData.append('name', userData.name);

      if (userData.avatarFile) {
        formData.append('avatar', userData.avatarFile);
      }

      const res = await fetch('http://localhost:8000/api/user', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formData
      });

      const data = await res.json();

      setUserData({
        ...data,
        avatarFile: null
      });

      localStorage.setItem('user', JSON.stringify(data));
      persistWorkspaceFromUser(data);
      setIsEditModalOpen(false);

    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="px-8">Cargando...</p>;

  // 🔥 AVATAR DINÁMICO
  const avatarSrc = userData.avatarFile
    ? URL.createObjectURL(userData.avatarFile)
    : userData.avatar || `https://ui-avatars.com/api/?name=${userData.name}`;

  return (
    <div className="flex justify-end items-center gap-3 pt-8 px-8 mb-10 relative">

      {/* SETTINGS */}
      <button onClick={() => togglePanel('settings')}
        className={`p-2.5 rounded-full ${activePanel === 'settings' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
        <Settings size={20} />
      </button>

      {/* NOTIFICATIONS */}
      <button onClick={() => togglePanel('notifications')}
        className={`p-2.5 rounded-full ${activePanel === 'notifications' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
        <Bell size={20} />
      </button>

      {/* PROFILE */}
      <div onClick={() => togglePanel('profile')}
        className="flex items-center gap-3 cursor-pointer">

        <img src={avatarSrc} className="w-10 h-10 rounded-full object-cover" />

        <div>
          <p className="font-bold">{userData.name}</p>
        </div>
      </div>

      {/* MODAL EDIT */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">

            <div className="absolute inset-0 bg-black/40"
              onClick={() => setIsEditModalOpen(false)} />

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white p-6 rounded-2xl w-96 z-50"
            >
              <div className="flex justify-between mb-4">
                <h2 className="font-bold">Editar perfil</h2>
                <button onClick={() => setIsEditModalOpen(false)}><X /></button>
              </div>

              {/* AVATAR */}
              <div className="flex flex-col items-center gap-4">

                <div className="relative">
                  <img src={avatarSrc}
                    className="w-24 h-24 rounded-full object-cover" />

                  <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer">
                    <Camera size={14} color="white" />
                    <input type="file" className="hidden"
                      onChange={handleImageChange} />
                  </label>
                </div>

                {/* NAME */}
                <input
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  className="w-full border p-2 rounded"
                />

                <button onClick={handleSave}
                  className="w-full bg-blue-600 text-white p-3 rounded">
                  Guardar
                </button>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PANEL */}
      <AnimatePresence>
        {activePanel && (
          <>
            <div className="fixed inset-0 bg-black/10"
              onClick={() => setActivePanel(null)} />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 w-80 h-full bg-white shadow p-6 z-50"
            >

              <div className="flex justify-between mb-6">
                <h2 className="font-bold">
                  {activePanel === 'profile' ? 'Perfil' :
                   activePanel === 'notifications' ? 'Notificaciones' :
                   'Configuración'}
                </h2>
                <button onClick={() => setActivePanel(null)}><X /></button>
              </div>

              {/* PROFILE PANEL */}
              {activePanel === 'profile' && (
                <button onClick={() => setIsEditModalOpen(true)}>
                  Editar perfil
                </button>
              )}

              {/* NOTIFICATIONS */}
              {activePanel === 'notifications' && (
                <p>Sin notificaciones</p>
              )}

              {/* SETTINGS */}
              {activePanel === 'settings' && (
                <div className="space-y-4">

                  <div className="flex justify-between">
                    <span>Modo oscuro</span>
                    <button onClick={() => setDarkMode(!darkMode)}>
                      {darkMode ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="flex justify-between">
                    <span>Idioma</span>
                    <span>ES</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Seguridad</span>
                    <ShieldCheck size={16} />
                  </div>

                </div>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}