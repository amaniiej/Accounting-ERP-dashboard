// src/components/features/report/FinalReport.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Printer, Save, History, Key, QrCode, X, PenTool } from 'lucide-react';
import { useLedger } from '../../../context/LedgerContext';
import { translations as masterTranslations } from '../../../i18n/translations';

const FinalReport: React.FC = () => {
  const { profile, transactions, language } = useLedger();
  const t = masterTranslations[language] || {}; // Fallback to empty object
  
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [showSigModal, setShowSigModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [storageCode, setStorageCode] = useState('0x00004E67AD');
  
  const reportRef = useRef<HTMLDivElement>(null);

  const totalRevenue = transactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
  const netProfit = totalRevenue - totalExpense;

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 100; canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'black'; ctx.fillRect(10, 10, 80, 80);
      setQrCodeDataUrl(canvas.toDataURL());
    }
  }, [transactions]);

  const glassCard: React.CSSProperties = { background: 'white', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' };
  const sheetStyle: React.CSSProperties = { width: '100%', maxWidth: '750px', minHeight: '900px', background: 'white', padding: '60px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', position: 'relative', display: 'flex', flexDirection: 'column', color: '#1E293B' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '30px' }}>
      
      {/* LEFT: THE SHEET (8/12) */}
      <div style={{ gridColumn: 'span 8', display: 'flex', justifyContent: 'center' }}>
        <div ref={reportRef} style={sheetStyle}>
           <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', fontSize: '80px', fontWeight: 900, color: '#F8FAFC', zIndex: 0, pointerEvents: 'none' }}>
             {t.watermark || "OFFICIAL"}
           </div>

           <div style={{ borderBottom: '3px solid #1E293B', paddingBottom: '20px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', zIndex: 1 }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 900 }}>{profile.name}</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>{profile.address}</div>
                <div style={{ fontSize: '11px', fontWeight: 700 }}>TIN: {profile.tin}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: 900 }}>{t.report || "FINAL REPORT"}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#2563EB' }}>JANUARY 2026</div>
              </div>
           </div>

           <table style={{ width: '100%', borderCollapse: 'collapse', zIndex: 1 }}>
              <thead><tr style={{ borderBottom: '2px solid #1E293B' }}><th style={{ textAlign: 'left', padding: '10px 0' }}>DESCRIPTION</th><th style={{ textAlign: 'right', padding: '10px 0' }}>AMOUNT</th></tr></thead>
              <tbody>
                 {transactions.map(line => (
                    <tr key={line.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 0', fontWeight: 600 }}>{line.motif}</td>
                      <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 700 }}>{line.amount.toLocaleString()}</td>
                    </tr>
                 ))}
                 <tr style={{ borderTop: '2px solid #1E293B' }}>
                   <td style={{ paddingTop: '20px', fontWeight: 800 }}>{t.net || "NET PROFIT"}</td>
                   <td style={{ paddingTop: '20px', textAlign: 'right', fontWeight: 900, fontSize: '18px' }}>{netProfit.toLocaleString()} ETB</td>
                 </tr>
              </tbody>
           </table>

           <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 1 }}>
              <div style={{ width: '250px' }}>
                 <div style={{ fontSize: '10px', fontWeight: 800, marginBottom: '5px' }}>{t.digSig || "SIGNATURE"}</div>
                 <div onClick={() => setShowSigModal(true)} style={{ height: '50px', border: '1px dashed #CBD5E1', borderRadius: '4px', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                   {signatureImage ? <img src={signatureImage} style={{ maxHeight: '40px' }} /> : <span style={{ color: '#94A3B8', fontSize: '10px' }}>Click to sign</span>}
                 </div>
                 <div style={{ borderBottom: '1px solid #000', marginTop: '20px' }}></div>
                 <div style={{ fontSize: '10px', fontWeight: 700, textAlign: 'center', marginTop: '5px' }}>{t.auth || "AUTHORIZED"}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                 <img src={qrCodeDataUrl} style={{ width: '80px', height: '80px', border: '1px solid #000' }} />
                 <div style={{ fontSize: '9px', fontWeight: 700, marginTop: '5px' }}><QrCode size={10} style={{ display:'inline', marginRight:'5px' }}/> VERIFIED DOCUMENT</div>
              </div>
           </div>
        </div>
      </div>

      {/* RIGHT: JOURNAL (4/12) */}
      <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '20px' }}>
         <div style={glassCard}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px' }}><History size={18} color="#2563EB"/><b>{t.audit || "AUDIT"}</b></div>
            <div style={{ fontSize: '12px', fontWeight: 800 }}>System Generated</div>
            <div style={{ fontSize: '10px', color: '#94A3B8' }}>10:35 AM • Verified</div>
         </div>
         <div style={{ ...glassCard, background: '#1E293B', color: 'white', border: 'none' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}><Key size={18} color="#60A5FA"/><b>{t.storage || "STORAGE"}</b></div>
            <input value={storageCode} onChange={e=>setStorageCode(e.target.value)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '12px', borderRadius: '10px', color: 'white', fontSize: '12px', width: '100%' }} />
         </div>
      </div>

      {/* MODAL */}
      {showSigModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '24px', width: '500px' }}>
             <h3>{t.auth || "Authorize Document"}</h3>
             <button onClick={() => setShowSigModal(false)} style={{ background: '#1E293B', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', width: '100%', cursor: 'pointer', marginTop: '20px' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalReport;