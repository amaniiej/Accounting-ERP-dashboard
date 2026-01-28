// src/components/layout/Header.tsx
import React from 'react';
import { Menu as MenuIcon, Bell, Search, Settings } from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';
import { translations } from '../../i18n/translations';

const Header: React.FC = () => {
  const { language, activeTab, profile } = useLedger();
  const t = translations[language];

  const titles: Record<string, string> = {
    'general-table': t.generalTable,
    'money-flow': t.moneyFlow,
    'bills': t.bills,
    'tax': t.tax,
    'report': t.report,
    'contact': t.contact
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
          {profile.name} / {t.menu}
        </div>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 900, color: '#1E293B', letterSpacing: '-0.5px' }}>
          {titles[activeTab] || 'Dashboard'}
        </h1>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {/* Search Input - Very "Pro" */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '8px 15px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
           <Search size={16} color="#94A3B8" />
           <input placeholder="Search..." style={{ border: 'none', outline: 'none', marginLeft: '10px', fontSize: '13px', width: '150px' }} />
        </div>

        <button style={{ background: 'white', border: '1px solid #E2E8F0', padding: '10px', borderRadius: '12px', cursor: 'pointer', color: '#64748B' }}>
          <Bell size={18} />
        </button>

        <button style={{
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