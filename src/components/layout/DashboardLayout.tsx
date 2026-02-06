import React, { useState, useRef, lazy, Suspense } from 'react';
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
  AlertTriangle,
  Folder
} from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

// Context & Translations
import { useLedger } from '../../context/LedgerContext';
import { translations } from '../../i18n/translations';
import Header from './Header';

// --- Imports Paresseux (Lazy) ---
// Note : Assure-toi que les chemins correspondent exactement à tes dossiers
const BusinessCommandCenter = lazy(() => import('../features/dashboard/BusinessCommandCenter'));
const MoneyFlow = lazy(() => import('../features/money-flow/MoneyFlow'));
const BillsInvoices = lazy(() => import('../features/invoices/BillsInvoices'));
const TaxTracker = lazy(() => import('../features/tax/TaxTracker'));
const Contact = lazy(() => import('../features/contacts/Contact'));
const ActivityManagement = lazy(() => import('../features/Activity/activitymanagement'));
const Inventory = lazy(() => import('../features/Inventory/inventory'));
const ActivityCreation = lazy(() => import('../features/Salary/activitycreation'));
const Chat = lazy(() => import('../features/chat/Chat'));
const ProjectCreativity = lazy(() => import('../features/ProjectCreativity/ProjectCreativity'));

// --- Composants de secours (UI) ---

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-64 space-y-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <p className="text-slate-500 animate-pulse">Chargement...</p>
  </div>
);

const ErrorFallback = ({ message }: { message: string }) => (
  <div className="p-8 bg-red-50 border border-red-200 rounded-2xl flex flex-col items-center text-center">
    <AlertTriangle className="text-red-500 mb-4" size={48} />
    <h3 className="text-lg font-bold text-red-800">Erreur d'affichage</h3>
    <p className="text-red-600 mt-2">{message}</p>
    <button 
      onClick={() => window.location.reload()}
      className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
    >
      Actualiser la page
    </button>
  </div>
);

// --- Composants de Navigation ---

const FloatingDockItem = ({ mouseY, icon: Icon, title, isActive, onClick }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseY, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
    return val - bounds.y - bounds.height / 2;
  });

  const size = useSpring(useTransform(distance, [-150, 0, 150], [45, 60, 45]), { 
    mass: 0.1, stiffness: 200, damping: 15 
  });

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className={`
        aspect-square rounded-full flex items-center justify-center relative cursor-pointer
        shadow-lg border border-slate-200 transition-colors
        ${isActive ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}
      `}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 60 }} exit={{ opacity: 0, x: 10 }}
            className="absolute left-full px-3 py-1 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap z-50"
          >
            {title}
          </motion.div>
        )}
      </AnimatePresence>
      <Icon size={24} />
    </motion.div>
  );
};

const MenuItem = ({ icon: Icon, title, isActive, onClick }: any) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1
      ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}
    `}
  >
    <Icon size={20} />
    <span className="font-semibold text-sm">{title}</span>
  </button>
);

// --- Composant Principal ---

const DashboardLayout: React.FC = () => {
  const ledgerContext = useLedger();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const mouseY = useMotionValue(Infinity);
  const [globalSearch, setGlobalSearch] = useState('');

  // Sécurité si le contexte est manquant
  if (!ledgerContext) {
    return <ErrorFallback message="Le contexte Ledger est introuvable. Vérifiez votre Provider." />;
  }

  const { activeTab, setActiveTab, language } = ledgerContext;
  const t = translations[language] || translations['en'];

  const isChatActive = activeTab === 'chat';

  const menuItems = [
    { id: 'general-table', title: 'Tableau de bord', icon: LayoutGrid },
    { id: 'money-flow', title: t.moneyFlow || 'Flux Financier', icon: ArrowRightLeft },
    { id: 'activity-management', title: 'Calendrier', icon: Activity },
    { id: 'payroll-management', title: 'Salaires', icon: DollarSign },
    { id: 'inventory', title: 'Inventaire', icon: Boxes },
    { id: 'activity-creation', title: 'Nouveau Projet', icon: PenSquare },
    { id: 'chat', title: 'Chat', icon: MessageSquare },
    { id: 'bills', title: t.bills || 'Factures', icon: FileText },
    { id: 'tax', title: t.tax || 'Taxes', icon: Landmark },
    { id: 'contact', title: 'Contacts', icon: Phone },
    { id: 'project-creativity', title: 'Project Creativity', icon: Folder },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'general-table': return <BusinessCommandCenter />;
      case 'money-flow': return <MoneyFlow />;
      case 'bills': return <BillsInvoices />;
      case 'tax': return <TaxTracker />;
      case 'activity-management': return <ActivityManagement />;
      case 'payroll-management': return <BillsInvoices initialDocType="bulletin-paie" />;
      case 'inventory': return <Inventory />;
      case 'activity-creation': return <ActivityCreation />;
      case 'chat': return <Chat />;
      case 'contact': return <Contact />; 
      case 'project-creativity': return <ProjectCreativity />;
      default: return <BusinessCommandCenter />;
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      {/* Sidebar / Navigation */}
      <nav className={`
        flex flex-col bg-white border-r border-slate-200 transition-all duration-150 z-50
        ease-out ${isSidebarOpen ? 'w-64' : 'w-16'}
      `}>
        <div className="p-6 flex items-center h-20 gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
            <Settings size={22} />
          </div>
          {isSidebarOpen && <span className="font-bold text-xl tracking-tight">ABYSSINIA CYBERSEC PLC</span>}
        </div>

        <div 
          className="flex-1 px-4 overflow-y-auto"
          onMouseMove={(e) => !isSidebarOpen && mouseY.set(e.clientY)}
          onMouseLeave={() => mouseY.set(Infinity)}
        >
          <div className="flex flex-col items-center gap-2">
            {menuItems.map((item) => (
              isSidebarOpen ? (
                <MenuItem 
                  key={item.id} 
                  {...item} 
                  isActive={activeTab === item.id} 
                  onClick={() => setActiveTab(item.id)} 
                />
              ) : (
                <FloatingDockItem 
                  key={item.id} 
                  mouseY={mouseY} 
                  {...item} 
                  isActive={activeTab === item.id} 
                  onClick={() => setActiveTab(item.id)} 
                />
              )
            ))}
          </div>
        </div>

        <div className="p-4 border-t">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex justify-center p-3 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            <ArrowRightLeft size={20} className={isSidebarOpen ? "" : "rotate-180"} />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`flex-1 bg-white ${isChatActive ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
        <div className={`p-6 lg:p-10 max-w-7xl mx-auto w-full ${isChatActive ? 'h-full flex flex-col' : ''}`}>
          <Header onSearch={setGlobalSearch} searchTerm={globalSearch} />
          <div className={`mt-8 ${isChatActive ? 'flex-1 min-h-0 relative' : ''}`}>
            <Suspense fallback={<LoadingFallback />}>
              {renderContent()}
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;