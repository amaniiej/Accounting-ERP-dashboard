// src/components/layout/Header.tsx
import React from 'react';
import { Menu as MenuIcon, Search } from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';
import { translations } from '../../i18n/translations';

interface HeaderProps {
  onSearch?: (term: string) => void;
  searchTerm?: string;
}

const Header: React.FC<HeaderProps> = ({ onSearch, searchTerm = '' }) => {
  const { language, activeTab, profile, setActiveTab } = useLedger();
  const t = translations[language] || translations['en'] || {};

  const titles: Record<string, string> = {
    'general-table': 'General Table',
    'money-flow': t.moneyFlow,
    'bills': t.bills,
    'tax': t.tax,
    'contact': t.contact,
    'activity-management': 'Activity Management',
    'payroll-management': 'Payroll Management',
    'inventory': 'Inventory',
    'activity-creation': 'Project Creativity',
    'chat': 'Chat & Communication'
  };

  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '10px', // Reduced from 20px
      padding: '5px 10px',  // Tightened padding
      background: 'transparent', // Removed background to let content "float" higher
    }}>
      {/* ... rest of the code stays the same ... */}
      <div>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {profile?.name || 'ABYSSINIA CYBERSEC PLC'}
        </div>
        
        <div className="flex items-center gap-3">
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 900, color: '#1E293B', letterSpacing: '-0.5px' }}>
            {titles[activeTab] || 'Dashboard'}
          </h1>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>

        <button onClick={() => setActiveTab('general-table')} className="hover:bg-slate-800 hover:scale-105 hover:shadow-lg transition-all duration-200" style={{
          background: '#1E293B', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px',
          fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
        }}>
          <MenuIcon size={18} />
          {t.cmdPanel}
        </button>
      </div>
    </header>
  );
};

export default Header;