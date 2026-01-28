// src/components/features/tax/TaxTracker.tsx
import React, { useState, useMemo } from 'react';
import { 
  Scale, Calculator, BookOpen, TrendingUp, 
  Landmark, ShieldCheck, Search, Info, X, Gavel, Percent
} from 'lucide-react';

import { useLedger } from '../../../context/LedgerContext';
import { translations as masterTranslations } from '../../../i18n/translations';

const ETHIOPIAN_LAWS = [
  { id: 'law_vat', code: 'Proc. 285/2002', title: 'Value Added Tax (VAT)', keywords: ['vat', '15%'], summary: 'Le taux standard est de 15%. La TVA est facturée sur la fourniture de biens et services.', detail: 'L\'article 7 stipule un taux de 15%. La TVA payée sur les intrants (Input VAT) peut être déduite de la TVA collectée sur les ventes (Output VAT).' },
  { id: 'law_wht', code: 'Dir. 135/2019', title: 'Withholding Tax (WHT)', keywords: ['wht', '2%'], summary: 'Retenue à la source de 2% sur les paiements de biens et services dépassants 10,000 ETB.', detail: 'Tout agent de retenue doit retenir 2% du montant brut des paiements effectués pour la fourniture de biens ou services, si le montant dépasse 10,000 ETB.' },
  { id: 'law_profit', code: 'Proc. 979/2016', title: 'Federal Income Tax', keywords: ['profit', '30%'], summary: 'Impôt sur les sociétés (PLC) fixé à 30% du bénéfice imposable (Schedule C).', detail: 'Le revenu imposable est calculé en soustrayant les dépenses déductibles du revenu brut. Le taux pour les entités morales est de 30%.' },
  { id: 'law_penalties', code: 'Proc. 983/2016', title: 'Tax Administration & Penalties', keywords: ['penalty'], summary: 'Pénalité de 5% pour déclaration tardive, plus intérêt mensuel sur le montant dû.', detail: 'En cas de non-paiement à la date limite, une pénalité de 5% est appliquée immédiatement, suivie de 2% par mois.' },
  { id: 'law_tot', code: 'Proc. 308/2002', title: 'Turnover Tax (TOT)', keywords: ['tot', '2%'], summary: 'Applicable si non enregistré à la TVA. 2% sur biens, 2% ou 10% sur services.', detail: 'Remplace la TVA pour les petites entreprises (CA < 1M ETB).' }
];

const TaxTracker: React.FC = () => {
  const { transactions, language } = useLedger();
  const t = masterTranslations[language];
  
  const [searchLaw, setSearchLaw] = useState('');
  const [selectedLaw, setSelectedLaw] = useState<typeof ETHIOPIAN_LAWS[0] | null>(null);

  const taxEngine = useMemo(() => {
    const totalSales = transactions.filter(tx => tx.type === 'INCOME').reduce((acc, tx) => acc + tx.amount, 0);
    const totalExpenses = transactions.filter(tx => tx.type === 'EXPENSE').reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
    const vatOutput = totalSales * 0.15;
    const vatInput = (totalExpenses * 0.8) * 0.15; 
    const vatPayable = Math.max(0, vatOutput - vatInput);
    const whtLiableTx = transactions.filter(tx => tx.type === 'EXPENSE' && Math.abs(tx.amount) >= 10000);
    const whtPayable = whtLiableTx.reduce((acc, tx) => acc + (Math.abs(tx.amount) * 0.02), 0);
    const grossProfit = totalSales - totalExpenses;
    const profitTax = grossProfit > 0 ? grossProfit * 0.30 : 0;
    return { vat: { output: vatOutput, input: vatInput, payable: vatPayable }, wht: { payable: whtPayable, count: whtLiableTx.length }, profit: { gross: grossProfit, tax: profitTax }, totalLiability: vatPayable + whtPayable + profitTax };
  }, [transactions]);

  const filteredLaws = ETHIOPIAN_LAWS.filter(l => l.title.toLowerCase().includes(searchLaw.toLowerCase()) || l.keywords.some(k => k.includes(searchLaw.toLowerCase())));
  const fmt = (n: number) => new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(n);

  const glassStyle: React.CSSProperties = { background: 'white', border: '1px solid #E2E8F0', borderRadius: '24px', boxShadow: '0 8px 32px rgba(31, 38, 135, 0.05)', padding: '24px', color: '#1E293B' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px', fontFamily: 'sans-serif' }}>
      
      {/* MIDDLE CONTENT */}
      <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* TOP BANNER: FIXED TITLE ADDED HERE */}
        <div style={{ ...glassStyle, background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white', padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Landmark size={28} color="#F59E0B" /> 
              ETHIOPIAN TAX ENGINE
            </h2>
            <div style={{ marginTop: '8px', fontSize: '13px', display:'flex', gap:'15px', opacity: 0.8 }}>
              <span><ShieldCheck size={14} style={{display:'inline', marginRight:'5px'}} color="#10B981"/> {t.compliant}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 800, letterSpacing: '1px' }}>LIVE CALCULATION</div>
            <div style={{ fontSize: '42px', fontWeight: 900, color: '#F87171' }}>{fmt(taxEngine.totalLiability)}</div>
          </div>
        </div>

        {/* VAT & PROFIT GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={glassStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems:'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1E40AF', display:'flex', alignItems:'center', gap:'8px' }}>
                <Percent size={18}/> VAT (15%)
              </h3>
              <span style={{ fontSize: '10px', background: '#DBEAFE', color: '#1E40AF', padding: '4px 8px', borderRadius: '10px', fontWeight: 800 }}>Proc. 285/2002</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
                <span>Output VAT (Sales)</span>
                <span style={{fontWeight: 700, color: '#16A34A'}}>+ {fmt(taxEngine.vat.output)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
                <span>Input VAT (Purchases)</span>
                <span style={{fontWeight: 700, color: '#DC2626'}}>- {fmt(taxEngine.vat.input)}</span>
              </div>
              <div style={{ background: '#F1F5F9', padding: '15px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontWeight: 800, fontSize: '12px', color: '#1E293B' }}>{t.net}</span>
                <span style={{ fontWeight: 900, fontSize: '20px', color: '#1E293B' }}>{fmt(taxEngine.vat.payable)}</span>
              </div>
            </div>
          </div>

          <div style={glassStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems:'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1E40AF', display:'flex', alignItems:'center', gap:'8px' }}>
                <Calculator size={18}/> PROFIT TAX (30%)
              </h3>
              <span style={{ fontSize: '10px', background: '#DBEAFE', color: '#1E40AF', padding: '4px 8px', borderRadius: '10px', fontWeight: 800 }}>Proc. 979/2016</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
                <span>Gross Profit</span>
                <span style={{fontWeight: 700, color: '#1E293B'}}>{fmt(taxEngine.profit.gross)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
                <span>Corporate Rate</span>
                <span style={{fontWeight: 700, color: '#1E293B'}}>30%</span>
              </div>
              <div style={{ background: '#F1F5F9', padding: '15px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontWeight: 800, fontSize: '12px', color: '#1E293B' }}>{t.est}</span>
                <span style={{ fontWeight: 900, fontSize: '18px', color: '#1E293B' }}>{fmt(taxEngine.profit.tax)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* WHT STRIP */}
        <div style={{ ...glassStyle, padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: taxEngine.wht.count > 0 ? '#FEF2F2' : 'white', border: taxEngine.wht.count > 0 ? '1px solid #FECACA' : '1px solid #E2E8F0' }}>
           <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
              <div style={{background: '#EF4444', padding: '10px', borderRadius: '12px', color: 'white'}}><Scale size={24}/></div>
              <div>
                 <div style={{fontWeight: 800, color: '#991B1B', fontSize: '15px'}}>WITHHOLDING TAX (2%)</div>
                 <div style={{fontSize: '12px', color: '#B91C1C'}}>Detected {taxEngine.wht.count} transaction(s) &gt; 10,000 ETB</div>
              </div>
           </div>
           <div style={{textAlign:'right'}}>
              <div style={{fontSize:'10px', color:'#7F1D1D', fontWeight:700}}>TO WITHHOLD</div>
              <div style={{fontSize:'22px', fontWeight:900, color:'#DC2626'}}>{fmt(taxEngine.wht.payable)}</div>
           </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div style={{ gridColumn: 'span 4', ...glassStyle, display: 'flex', flexDirection: 'column', minHeight: '550px' }}>
        <div style={{borderBottom: '1px solid #E2E8F0', paddingBottom: '15px', marginBottom: '20px'}}>
           <h3 style={{margin:0, fontSize: '18px', fontWeight: 800, color: '#1E3A8A', display:'flex', alignItems:'center', gap:'8px'}}>
             <BookOpen size={20} color="#2563EB"/> {t.laws}
           </h3>
           <p style={{fontSize: '11px', color: '#64748B', marginTop: '5px'}}>{t.ref}</p>
        </div>
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={16} color="#94A3B8" style={{position: 'absolute', left: '12px', top: '12px'}}/>
          <input type="text" placeholder={t.search} value={searchLaw} onChange={(e) => setSearchLaw(e.target.value)} style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }} />
        </div>
        <div style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
           {filteredLaws.map(law => (
             <div key={law.id} onClick={() => setSelectedLaw(law)} style={{ padding: '16px', borderRadius: '16px', background: 'white', border: '1px solid #F1F5F9', cursor: 'pointer', transition: '0.2s' }}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom: '5px'}}>
                   <span style={{fontSize: '10px', fontWeight: 800, color: '#2563EB', background: '#EFF6FF', padding: '4px 8px', borderRadius: '6px'}}>{law.code}</span>
                   <Info size={14} color="#94A3B8"/>
                </div>
                <div style={{fontWeight: 800, fontSize: '14px', color: '#1E293B'}}>{law.title}</div>
                <div style={{fontSize: '11px', color: '#64748B', lineHeight: '1.5', marginTop: '5px'}}>{law.summary}</div>
             </div>
           ))}
        </div>
      </div>

      {/* Modal restored */}
      {selectedLaw && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <div style={{ width: '500px', background: 'white', borderRadius: '32px', padding: '40px', position: 'relative' }}>
              <button onClick={() => setSelectedLaw(null)} style={{position:'absolute', top:'25px', right:'25px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '35px', height: '35px', cursor: 'pointer'}}><X size={20}/></button>
              <h2 style={{margin: '15px 0 20px 0', fontSize: '24px', fontWeight: 900}}>{selectedLaw.title}</h2>
              <div style={{background: '#F8FAFC', padding: '25px', borderRadius: '20px', border: '1px solid #E2E8F0'}}>
                 <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.7', margin: 0 }}>{selectedLaw.detail}</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TaxTracker;