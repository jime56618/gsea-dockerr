import React, { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, User, FileText,
  Calendar, DollarSign, GraduationCap,
  ClipboardList, LogOut, Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { MENU_ITEMS, ADMIN_MENU_ITEMS, filterMenuByPermissions } from "../utils/permissions";

import logoGSEA from "../assets/images/logo-gsea.png";

const PATH_ICONS = {
  "/dashboard": LayoutDashboard,
  "/tramites": ClipboardList,
  "/agentes": Users,
  "/clientes": User,
  "/seguimiento-polizas": FileText,
  "/seguimiento-cobranza": DollarSign,
  "/capacitacion": GraduationCap,
  "/calendario": Calendar,
  "/configuracion/equipo": Users,
  "/configuracion/roles": Settings,
  "/configuracion/facturacion": DollarSign,
};

function itemIcon(path) {
  const Icon = PATH_ICONS[path] || FileText;
  return <Icon size={22} />;
}

export default function SidebarGSEA({ onExpand }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();
  const { session, logout } = useAuth();

  const mainMenu = useMemo(
    () =>
      filterMenuByPermissions(MENU_ITEMS, session).map((item) => ({
        ...item,
        icon: itemIcon(item.path),
      })),
    [session]
  );

  const adminMenu = useMemo(
    () =>
      filterMenuByPermissions(ADMIN_MENU_ITEMS, session).map((item) => ({
        ...item,
        icon: itemIcon(item.path),
      })),
    [session]
  );

  const handleLogout = () => logout();
  const toggleExpand = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    onExpand?.(next);
  };

  return (
    <>
      {/* CSS para eliminar scroll y estilos premium */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Efecto de brillo en hover para items */
        .menu-item-hover {
          position: relative;
          overflow: hidden;
        }
        
        .menu-item-hover::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        
        .menu-item-hover:hover::after {
          opacity: 1;
        }
      `}</style>

      <motion.aside 
        initial={false}
        animate={{ width: isExpanded ? 280 : 88 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 bg-[#001E42] text-white flex flex-col shadow-2xl z-50 border-r border-blue-900/30"
      >
        {/* Barra interactiva para expandir/colapsar */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-400/20 transition-colors z-10 group"
          onClick={toggleExpand}
          title={isExpanded ? "Colapsar menú" : "Expandir menú"}
        >
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-400/30 rounded-full group-hover:bg-blue-400/60 transition-colors"></div>
        </div>

        {/* Logo Sección con tu logo importado */}
        <div className="h-24 flex items-center px-6 flex-shrink-0 relative">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="min-w-[48px] h-[48px] rounded-xl flex items-center justify-center overflow-hidden"
            >
              <img 
                src={logoGSEA} 
                alt="GSEA Logo" 
                className="w-full h-full object-contain"
              />
            </motion.div>
            
            <AnimatePresence mode="wait">
              {isExpanded && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    GSEA CRM
                  </h2>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Línea decorativa */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>

        {/* Módulos */}
        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-6 space-y-1">
          {mainMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="block group">
                <motion.div
                  className={`relative flex items-center h-11 rounded-xl transition-all duration-300 menu-item-hover ${
                    isActive 
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-600/30" 
                      : "hover:bg-blue-800/30"
                  } px-3`}
                  whileHover={{ x: isExpanded ? 8 : 0 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Indicador de activo */}
                  {isActive && isExpanded && (
                    <motion.div 
                      className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                      layoutId="activeIndicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  {/* Icono */}
                  <div className={`${isActive ? 'text-white' : 'text-blue-300/80 group-hover:text-blue-200'} transition-colors`}>
                    {item.icon}
                  </div>
                  
                  {/* Label */}
                  <AnimatePresence mode="wait">
                    {isExpanded && (
                      <motion.span 
                        className="ml-4 font-medium text-sm tracking-wide"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Tooltip para versión colapsada */}
                  {!isExpanded && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-gray-800 pointer-events-none">
                      <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-gray-800"></div>
                      {item.label}
                    </div>
                  )}
                </motion.div>
              </Link>
            );
          })}

          {adminMenu.length > 0 && isExpanded && (
            <p className="px-3 pt-4 pb-1 text-[10px] uppercase tracking-widest text-blue-300/60 font-bold">
              Configuración
            </p>
          )}
          {adminMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="block group">
                <motion.div
                  className={`relative flex items-center h-11 rounded-xl transition-all duration-300 menu-item-hover ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-600/30"
                      : "hover:bg-blue-800/30"
                  } px-3`}
                  whileHover={{ x: isExpanded ? 8 : 0 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`${isActive ? 'text-white' : 'text-blue-300/80 group-hover:text-blue-200'} transition-colors`}>
                    {item.icon}
                  </div>
                  <AnimatePresence mode="wait">
                    {isExpanded && (
                      <motion.span
                        className="ml-4 font-medium text-sm tracking-wide"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 flex-shrink-0">
          {/* Línea separadora */}
          <div className="mx-1 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent mb-3"></div>
          
          {/* Cerrar Sesión */}
          <motion.button 
            onClick={handleLogout}
            whileHover={{ scale: 1.02, x: isExpanded ? 5 : 0 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center w-full h-11 px-3 rounded-xl hover:bg-red-500/10 text-red-400/90 hover:text-red-400 group transition-all duration-300 relative"
          >
            <LogOut size={22} />
            
            <AnimatePresence mode="wait">
              {isExpanded && (
                <motion.span 
                  className="ml-4 font-medium text-sm tracking-wide"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  Cerrar Sesión
                </motion.span>
              )}
            </AnimatePresence>

            {/* Tooltip para logout */}
            {!isExpanded && (
              <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-gray-800 pointer-events-none">
                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-gray-800"></div>
                Cerrar Sesión
              </div>
            )}
          </motion.button>

          {/* Versión */}
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="mt-4 text-center"
              >
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Efecto de brillo */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 via-transparent to-transparent pointer-events-none"></div>
      </motion.aside>

      {/* Margen dinámico para contenido */}
      <div style={{ marginLeft: isExpanded ? 280 : 88 }} className="transition-all duration-300 ease-in-out" />
    </>
  );
}