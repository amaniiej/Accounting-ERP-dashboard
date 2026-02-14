import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, ArrowRightLeft, Boxes, Landmark, FileText, DollarSign, Activity } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react'; // Import Lock icon

const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  const menuItems = [
    { path: '/dashboard', title: 'Command Center', icon: LayoutGrid },
    { path: '/money-flow', title: 'Money Flow', icon: ArrowRightLeft },
    { path: '/activity', title: 'Activity', icon: Activity },
    { path: '/payroll', title: 'Payroll', icon: DollarSign },
    { path: '/inventory', title: 'Inventory', icon: Boxes },
    { path: '/vault', title: 'Secure Vault', icon: Lock },
    { path: '/tax', title: 'Tax Tracker', icon: Landmark },
    { path: '/reports', title: 'Reports', icon: FileText },
  ];

  return (
    <nav className={`h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-6 flex items-center justify-between h-20">
        <span className={`font-black text-xl text-blue-600 tracking-tighter ${!isSidebarOpen && 'hidden'}`}>
          AgroSpace
        </span>
        <button onClick={toggleSidebar} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <div className="flex flex-col gap-1">
            <span className="w-5 h-0.5 bg-slate-600"></span>
            <span className="w-3 h-0.5 bg-slate-600"></span>
            <span className="w-5 h-0.5 bg-slate-600"></span>
          </div>
        </button>
      </div>

      <div className="flex-1 px-3 space-y-2 mt-4 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
              ${isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'}
            `}
          >
            <item.icon size={22} className="shrink-0" />
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-semibold text-sm whitespace-nowrap"
              >
                {item.title}
              </motion.span>
            )}
            
            {/* Tooltip for collapsed state */}
            {!isSidebarOpen && (
              <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {item.title}
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;