// src/components/features/dashboard/BusinessCommandCenter.tsx
import React, { useState } from 'react';
import { ShieldCheck, ScanLine, Activity, Lock, Download, TrendingUp, DollarSign } from 'lucide-react';
import { useLedger } from '../../../context/LedgerContext';
import { translations } from '../../../i18n/translations';
import OCRScannerModal from './OCRScanner';

const BusinessCommandCenter: React.FC = () => {
  const { profile, transactions, language, docs } = useLedger();
  const [showOCR, setShowOCR] = useState(false);
  const t = translations[language];

  const rev = transactions.filter(t => t.amount > 0).reduce((a, b) => a + b.amount, 0);
  const exp = transactions.filter(t => t.amount < 0).reduce((a, b) => a + Math.abs(b.amount), 0);
  const net = rev - exp;

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.05)',
    display: 'flex',
    flexDirection: 'column'
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
      {showOCR && <OCRScannerModal onClose={() => setShowOCR(false)} />}

      {/* Profile Card (8 cols) */}
      <div style={{ ...cardStyle, gridColumn: 'span 8', flexDirection: 'row', alignItems: 'center', gap: '25px' }}>
        <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #2563EB, #1E40AF)', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '28px', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)' }}>
          {profile.initial}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ background: '#DCFCE7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 800, width: 'fit-content', marginBottom: '8px' }}>
            <ShieldCheck size={12} style={{ display: 'inline', marginRight: '5px' }} /> {t.active} LICENSE
          </div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#1E293B' }}>{profile.name}</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748B' }}>{profile.address} • {profile.tin}</p>
        </div>
      </div>

      {/* Net Profit Card (4 cols) */}
      <div style={{ ...cardStyle, gridColumn: 'span 4', background: 'white', justifyContent: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.netProfit}</span>
        <div style={{ fontSize: '36px', fontWeight: 900, color: net >= 0 ? '#10B981' : '#EF4444', margin: '5px 0' }}>
          {net.toLocaleString()} <span style={{ fontSize: '16px', color: '#CBD5E1' }}>ETB</span>
        </div>
        <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>+12.5% from last month</div>
      </div>

      {/* Stats Section (7 cols) */}
      <div style={{ ...cardStyle, gridColumn: 'span 7' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={20} color="#2563EB" /> {t.finResult}
            </h3>
         </div>
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
               <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8' }}>{t.rev}</span>
               <div style={{ fontSize: '24px', fontWeight: 900, color: '#2563EB', marginTop: '5px' }}>{rev.toLocaleString()}</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
               <span style={{ fontSize: '10px', fontWeight: 800, color: '#94A3B8' }}>{t.exp}</span>
               <div style={{ fontSize: '24px', fontWeight: 900, color: '#EF4444', marginTop: '5px' }}>{exp.toLocaleString()}</div>
            </div>
         </div>
      </div>

      {/* Vault Card (5 cols) */}
      <div style={{ ...cardStyle, gridColumn: 'span 5', background: '#1E293B', color: 'white', border: 'none', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(20px)' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
          <span style={{ fontWeight: 900, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={16} color="#60A5FA"/> {t.vault}</span>
          <span style={{ fontSize: '9px', background: '#334155', padding: '4px 10px', borderRadius: '20px', fontWeight: 800 }}>{t.encrypted}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '140px', position: 'relative', zIndex: 1 }}>
          {docs.map((doc, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <TrendingUp size={14} color="#60A5FA" />
                <span style={{ fontWeight: 600 }}>{doc.name}</span>
              </div>
              <Download size={14} style={{ opacity: 0.5, cursor: 'pointer' }} />
            </div>
          ))}
          <button onClick={() => setShowOCR(true)} style={{ marginTop: '5px', background: 'rgba(255,255,255,0.1)', border: '1px dashed rgba(255,255,255,0.3)', padding: '12px', borderRadius: '12px', color: 'white', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
            + Upload Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessCommandCenter;