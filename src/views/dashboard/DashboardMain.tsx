// src/views/dashboard/DashboardMain.tsx
import React, { useState, useRef, lazy, Suspense, useMemo } from 'react';
import {
  LayoutGrid,
  ArrowRightLeft,
  FileText,
  Landmark,
  Settings,
  Activity,
  DollarSign,
  Boxes,
  Phone,
  PenSquare,
  MessageSquare,
  Search,
  Folder
} from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

// Context & Translations
import { useLedger } from '../../context/LedgerContext';
import { translations } from '../../i18n/translations';

// Composants de base
const Header = lazy(() => import('../../components/layout/Header'));

// Feature Components - Imports Lazy
const BusinessCommandCenter = lazy(() => import('../../components/features/dashboard/BusinessCommandCenter'));
const MoneyFlow = lazy(() => import('../../components/features/money-flow/MoneyFlow'));
const BillsInvoices = lazy(() => import('../../components/features/invoices/BillsInvoices'));
const TaxTracker = lazy(() => import('../../components/features/tax/TaxTracker'));
const Contact = lazy(() => import('../../components/features/contacts/Contact'));
const ActivityManagement = lazy(() => import('../../components/features/Activity/activitymanagement'));
const SalaryPayroll = lazy(() => import('../../components/features/Salary/salarypayroll'));
const Inventory = lazy(() => import('../../components/features/Inventory/inventory'));
const ActivityCreation = lazy(() => import('../../components/features/Salary/activitycreation'));
const Chat = lazy(() => import('../../components/features/chat/Chat'));
const ProjectCreativity = lazy(() => import('../../components/features/ProjectCreativity/ProjectCreativity'));

// Composant de fallback pour le Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Composant de fallback pour les erreurs
const FallbackComponent = ({ name }: { name: string }) => (
  <div className="p-8 bg-yellow-50 border border-yellow-200 rounded-xl">
    <h3 className="text-lg font-semibold text-yellow-800">Component Not Loaded</h3>
    <p className="text-yellow-600 mt-2">{name} component could not be loaded.</p>
    <p className="text-sm text-yellow-500 mt-1">Please check the component file path and ensure it exists.</p>
  </div>
);

// Composant Floating Dock Item
const FloatingDockItem = ({
  mouseY,
  icon: Icon,
  title,
  isActive,
  onClick,
}: {
  mouseY: any;
  icon: any;
  title: string;
  isActive: boolean;
  onClick: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseY, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
    return val - bounds.y - bounds.height / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [45, 80, 45]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [45, 80, 45]);
  const iconScaleTransform = useTransform(distance, [-150, 0, 150], [1, 1.5, 1]);

  const width = useSpring(widthTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  const height = useSpring(heightTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  const iconScale = useSpring(iconScaleTransform, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <motion.div
      ref={ref}
      style={{ width, height }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className={`
        aspect-square rounded-full flex items-center justify-center relative cursor-pointer
        border border-white/20
        ${isActive 
          ? 'bg-blue-600 text-white shadow-inner' 
          : 'bg-white text-blue-600 shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff] hover:shadow-[inset_6px_6px_12px_#cbd5e1,inset_-6px_-6px_12px_#ffffff]'
        }
      `}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.6 }}
            animate={{ opacity: 1, x: 70, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.6 }}
            className="absolute left-full px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg whitespace-nowrap z-50 pointer-events-none"
          >
            {title}
            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div style={{ scale: iconScale }} className="flex items-center justify-center">
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      </motion.div>

      {/* Indicateur actif pulsant */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blue-400"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Badge notification pour chat */}
      {title === 'Chat & Communication' && (
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
      )}
    </motion.div>
  );
};

// Composant Menu Classique
const MenuItem = ({ 
  icon: Icon, 
  title, 
  isActive, 
  onClick 
}: { 
  icon: any; 
  title: string; 
  isActive: boolean; 
  onClick: () => void;
}) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02, x: 4 }}
    whileTap={{ scale: 0.98 }}
    className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 mb-1
      ${isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
        : 'text-slate-500 hover:bg-slate-100 hover:text-blue-600'
      }
    `}
  >
    <motion.div whileHover={{ rotate: 10 }} transition={{ type: "spring", stiffness: 400 }}>
      <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
    </motion.div>
    <span className={`font-semibold text-sm ${isActive ? 'text-white' : ''}`}>{title}</span>
    {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
  </motion.button>
);

const DashboardMain: React.FC = () => {
  // Vérifier que le contexte est disponible
  const context = useLedger();

  if (!context) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
          <p className="text-slate-600 mb-4">Ledger context is not available.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  const { activeTab, setActiveTab, language } = context;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const t = translations[language] || translations['en'] || {};
  const [globalSearch, setGlobalSearch] = useState('');
  
  // Motion value pour le floating dock
  const mouseY = useMotionValue(Infinity);

  const menuItems = [
    { id: 'general-table', title: 'General Table', icon: LayoutGrid },
    { id: 'money-flow', title: t.moneyFlow || 'Money Flow', icon: ArrowRightLeft },
    { id: 'activity-management', title: 'Calendar', icon: Activity },
    { id: 'payroll-management', title: 'Payroll Management', icon: DollarSign },
    { id: 'inventory', title: 'Inventory', icon: Boxes },
    { id: 'project-creativity', title: 'Project Creativity', icon: Folder },
    { id: 'chat', title: 'Chat & Communication', icon: MessageSquare },
    { id: 'bills', title: t.bills || 'Bills & Invoices', icon: FileText },
    { id: 'tax', title: t.tax || 'Tax Tracker', icon: Landmark },
    { id: 'contact', title: 'Contact', icon: Phone },
  ];

  const renderContent = () => {
    try {
      const commonProps = { searchTerm: globalSearch };
      switch(activeTab) {
        case 'general-table': return <BusinessCommandCenter {...commonProps} />;
        case 'money-flow': return <MoneyFlow {...commonProps} />;
        case 'bills': return <BillsInvoices />;
        case 'tax': return <TaxTracker {...commonProps} />;
        case 'activity-management': return <ActivityManagement {...commonProps} />;
        case 'payroll-management': return <SalaryPayroll {...commonProps} />;
        case 'inventory': return <Inventory {...(commonProps as any)} />;
        case 'project-creativity': return <ProjectCreativity />;
        case 'chat': return <Chat {...(commonProps as any)} />;
        case 'contact': return <Contact {...(commonProps as any)} />;
        default: return <BusinessCommandCenter {...commonProps} />;
      }
    } catch (error) {
      console.error('Error rendering content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return (
        <div className="p-8 bg-red-50 border border-red-200 rounded-xl">
          <h2 className="text-xl font-bold text-red-700">Error Loading Component</h2>
          <p className="mt-2 text-red-600">Failed to load the component for: {activeTab}</p>
          <p className="text-sm text-red-500 mt-1">Error: {errorMessage}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans text-slate-900" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      <nav 
        className={`
          flex flex-col bg-white/80 backdrop-blur-xl border-r border-slate-200 
          transition-all duration-300 ease-out z-50 overflow-visible
          ${isSidebarOpen ? 'w-72' : 'w-24'}
        `}
      >
        {/* Header */}
        <div className={`p-6 flex items-center h-20 ${isSidebarOpen ? 'gap-3' : 'justify-center'}`}>
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 cursor-pointer"
          >
            <Settings className="text-white" size={22} />
          </motion.div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-2xl text-slate-800 tracking-tight"
              >
                My Office
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div 
          className="flex-1 px-4 py-4 overflow-visible"
          onMouseMove={(e) => !isSidebarOpen && mouseY.set(e.clientY)}
          onMouseLeave={() => mouseY.set(Infinity)}
        >
          <div className={`flex ${isSidebarOpen ? 'flex-col gap-1' : 'flex-col items-center gap-3'}`}>
            {menuItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="w-full flex justify-center"
              >
                {isSidebarOpen ? (
                  <MenuItem
                    icon={item.icon}
                    title={item.title}
                    isActive={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                  />
                ) : (
                  <FloatingDockItem
                    mouseY={mouseY}
                    icon={item.icon}
                    title={item.title}
                    isActive={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Toggle */}
        <div className="p-4 border-t border-slate-100">
          <motion.button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center w-full px-4 py-3 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <motion.div
              animate={{ rotate: isSidebarOpen ? 0 : 180 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <ArrowRightLeft size={20} />
            </motion.div>
          </motion.button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto bg-white">
        <div className="p-6 lg:p-10">
          <Suspense fallback={<LoadingFallback />}>
            <Header onSearch={setGlobalSearch} searchTerm={globalSearch} />
          </Suspense>
          <div className="mt-6">
            <Suspense fallback={<LoadingFallback />}>
              {renderContent()}
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardMain;