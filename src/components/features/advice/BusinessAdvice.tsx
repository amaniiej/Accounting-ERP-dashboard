// src/components/features/advice/BusinessAdvice.tsx
import React, { useState } from 'react';
import { 
  Brain, TrendingDown, TrendingUp, Zap, 
  RefreshCw, Layers, Newspaper, ExternalLink, 
  Plus, X, Info
} from 'lucide-react';

// New Architecture Imports
import { useLedger } from '../../../context/LedgerContext';
import { translations as masterTranslations } from '../../../i18n/translations';

// --- TYPES ---
interface BusinessNewsItem {
  id: number;
  source: string;
  title: string;
  time: string;
  category: string;
  image: string;
}

interface ProductHealth {
  id: string;
  name: string;
  currentPrice: number;
  volume: 'High' | 'Med' | 'Low';
  margin: number;
  status: 'Star' | 'CashCow' | 'Problem' | 'Dog';
}

const BusinessAdvice: React.FC = () => {
  // 1. Hook into Global Store
  const { language } = useLedger();
  const t = masterTranslations[language];

  // 2. Local State: Simulator
  const [basePrice, setBasePrice] = useState<number>(100);
  const [marginIncrease, setMarginIncrease] = useState<number>(10); 
  const [useInflation, setUseInflation] = useState<boolean>(true);
  const [inflationRate, setInflationRate] = useState<number>(10);

  // 3. Local State: Portfolio
  const [portfolio, setPortfolio] = useState<ProductHealth[]>([
    { id: '1', name: 'Macchiato', currentPrice: 35, volume: 'High', margin: 65, status: 'CashCow' },
    { id: '2', name: 'Tir Sega (1kg)', currentPrice: 900, volume: 'Med', margin: 22, status: 'Problem' },
    { id: '3', name: 'Consulting IT', currentPrice: 2500, volume: 'High', margin: 85, status: 'Star' },
  ]);

  // 4. Local State: News
  const [newsItems] = useState<BusinessNewsItem[]>([
    { id: 1, source: 'Addis Fortune', title: 'Ethiopian Coffee Exports Hit Record $1.3B', time: '2h ago', category: 'Export', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150' },
    { id: 2, source: 'Capital Ethiopia', title: 'National Bank New Directive on Forex', time: '4h ago', category: 'Finance', image: 'https://images.unsplash.com/photo-1611974765270-ca1258634369?w=150' },
  ]);

  // Calculations
  const inflationMultiplier = useInflation ? (1 + inflationRate / 100) : 1;
  const calculatedPrice = basePrice * (1 + marginIncrease / 100) * inflationMultiplier;
  const priceDelta = calculatedPrice - basePrice;

  // Styles
  const glassCard: React.CSSProperties = {
    background: 'white', border: '1px solid #E2E8F0', borderRadius: '24px',
    padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column'
  };

  const simulatorGlass: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(34, 197, 94, 0.1))',
    backdropFilter: 'blur(10px)', borderRadius: '24px', border: '1px solid rgba(34, 197, 94, 0.2)',
    padding: '24px', color: '#064E3B'
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
      
      {/* LEFT COLUMN (7/12) */}
      <div style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* SCENARIO SIMULATOR */}
        <div style={simulatorGlass}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, display:'flex', alignItems:'center', gap:'10px' }}>
                 <Zap size={20} color="#059669"/> {t.sim}
              </h3>
              <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.5)', padding: '4px 12px', borderRadius: '20px', fontWeight: 800 }}>{t.mode}</span>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, opacity: 0.6 }}>{t.price}</label>
                    <input type="number" value={basePrice} onChange={(e) => setBasePrice(parseFloat(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '12px', border: 'none', background: 'white', marginTop: '5px', fontWeight: 700 }} />
                 </div>
                 <div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', fontWeight:700 }}>
                       <span>{t.adj}</span>
                       <span style={{ color:'#059669' }}>{marginIncrease}%</span>
                    </div>
                    <input type="range" min="-50" max="200" value={marginIncrease} onChange={(e) => setMarginIncrease(parseInt(e.target.value))} style={{ width:'100%', marginTop:'10px' }} />
                 </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: '20px', padding: '20px', textAlign: 'center', display:'flex', flexDirection:'column', justifyContent:'center' }}>
                 <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.5 }}>{t.newPrice}</div>
                 <div style={{ fontSize: '32px', fontWeight: 900 }}>{Math.round(calculatedPrice)} <span style={{ fontSize: '14px' }}>ETB</span></div>
                 <div style={{ color: priceDelta >= 0 ? '#059669' : '#DC2626', fontSize: '12px', fontWeight: 700, marginTop: '5px' }}>
                    {priceDelta >= 0 ? '+' : ''}{Math.round(priceDelta)} ETB / Unit
                 </div>
              </div>
           </div>
        </div>

        {/* PORTFOLIO HEALTH */}
        <div style={glassCard}>
           <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 800, display:'flex', alignItems:'center', gap:'10px' }}>
              <Layers size={18} color="#2563EB"/> {t.health}
           </h3>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {portfolio.map(prod => (
                 <div key={prod.id} style={{ border: '1px solid #F1F5F9', padding: '15px', borderRadius: '16px', background: '#F8FAFC' }}>
                    <div style={{ fontWeight: 800, fontSize: '14px' }}>{prod.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Margin: {prod.margin}% • Price: {prod.currentPrice} ETB</div>
                    <div style={{ marginTop: '10px', fontSize: '10px', fontWeight: 900, color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '4px', width: 'fit-content' }}>
                       {prod.status}
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* RIGHT COLUMN (5/12) - NEWS FEED */}
      <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '20px' }}>
         <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <Newspaper size={20} color="#2563EB" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>{t.news}</h3>
         </div>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {newsItems.map(news => (
               <div key={news.id} style={{ ...glassCard, padding: '12px', flexDirection: 'row', gap: '15px' }}>
                  <img src={news.image} style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                     <div style={{ fontSize: '9px', fontWeight: 800, color: '#2563EB', marginBottom: '4px' }}>{news.category}</div>
                     <div style={{ fontSize: '13px', fontWeight: 700, lineHeight: '1.3' }}>{news.title}</div>
                     <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>{news.source} • {news.time}</div>
                  </div>
               </div>
            ))}
         </div>
      </div>

    </div>
  );
};

export default BusinessAdvice;