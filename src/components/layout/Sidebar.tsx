// src/components/layout/Sidebar.tsx
import React from 'react';
import { Table, Activity, Receipt, Scale, FileBarChart, Phone, ShieldCheck } from 'lucide-react';
import { useLedger } from '../../context/LedgerContext';
import { translations } from '../../i18n/translations';

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, setIsExpanded }) => {
  const { language, setLanguage, activeTab, setActiveTab } = useLedger();
  const t = translations[language];

  const menuItems = [
    { id: 'general-table', title: t.generalTable, icon: Table },
    { id: 'money-flow', title: t.moneyFlow, icon: Activity },
    { id: 'bills', title: t.bills, icon: Receipt },
    { id: 'tax', title: t.tax, icon: Scale },
    { id: 'report', title: t.report, icon: FileBarChart },
    { id: 'contact', title: t.contact, icon: Phone },
  ];

  return (
    <nav 
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      style={{
        // FINAL WIDTH TWEAK: 67px minimized
        width: isExpanded ? '247px' : '67px',
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        margin: '10px',
        borderRadius: '24px',
        padding: '30px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)', 
        border: '1px solid rgba(255,255,255,0.8)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
        zIndex: 50,
        overflow: 'hidden',
        willChange: 'width'
      }}
    >
      {/* Logo Section */}
      <div style={{ 
        width: '100%',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isExpanded ? 'flex-start' : 'center',
        padding: isExpanded ? '0 25px' : '0',
        marginBottom: '40px',
        transition: '0.4s ease'
      }}>
        <div style={{ 
          minWidth: '34px', height: '34px', 
          background: '#2563EB', borderRadius: '10px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)'
        }}>
          <ShieldCheck size={18} color="white" />
        </div>
        {isExpanded && (
          <span style={{ 
            fontWeight: 900, color: '#1E3A8A', fontSize: '16px', marginLeft: '12px',
            whiteSpace: 'nowrap'
          }}>
            CyberNet
          </span>
        )}
      </div>

      {/* Menu Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        {menuItems.map(item => (
          <div key={item.id} style={{ padding: '0 8px', width: '100%' }}>
            <button 
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: isExpanded ? 'flex-start' : 'center',
                padding: '10px', 
                borderRadius: '14px', 
                border: 'none',
                background: activeTab === item.id ? 'white' : 'transparent',
                color: activeTab === item.id ? '#2563EB' : '#64748B',
                cursor: 'pointer', 
                transition: 'all 0.3s ease', 
                width: '100%',
                boxShadow: activeTab === item.id ? '0 4px 15px rgba(37, 99, 235, 0.05)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                <item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              </div>
              {isExpanded && (
                <span style={{ 
                  marginLeft: '12px',
                  fontWeight: 600, 
                  fontSize: '13px',
                  whiteSpace: 'nowrap'
                }}>
                  {item.title}
                </span>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Language Toggle */}
      <div style={{ marginTop: 'auto', width: '100%', padding: '0 10px' }}>
        <button 
          onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
          style={{ 
            width: '100%', border: 'none', background: 'rgba(0,0,0,0.03)', 
            borderRadius: '10px', padding: '10px 0', fontWeight: 900, 
            color: '#94A3B8', cursor: 'pointer', fontSize: '10px',
            textAlign: 'center', letterSpacing: '0.5px'
          }}
        >
          {isExpanded ? `LANGUAGE: ${language.toUpperCase()}` : language.toUpperCase()}
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;