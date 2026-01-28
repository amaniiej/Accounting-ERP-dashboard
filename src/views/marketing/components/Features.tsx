// src/components/marketing/Features.tsx
import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  Smartphone, Scale, Lock, FileBarChart, 
  History, Map, MessageSquare, Zap, ShieldCheck 
} from 'lucide-react';

const FEATURE_DATA = [
  { id: 1, color: "#3B82F6", icon: Smartphone, title: "Telebirr & CBE Sync", span: "col-span-2", desc: "Automatically convert SMS confirmations into ledger entries. 100% accurate daily reconciliation without lifting a finger.", badge: "MAGIC MOMENT" },
  { id: 2, color: "#10B981", icon: Scale, title: "ERCA Engine", span: "col-span-1", desc: "Live VAT (15%) & TOT math as you sell. No more tax-day panic." },
  { id: 3, color: "#8B5CF6", icon: MessageSquare, title: "AI Assistant", span: "col-span-1", desc: "Ask about margin drops or spending spikes. Get instant advice." },
  { id: 4, color: "#F59E0B", icon: FileBarChart, title: "Legal Reports", span: "col-span-2", desc: "Generate official A4 tax reports and proforma invoices ready for government submission in one click.", badge: "OFFICIAL" },
  { id: 5, color: "#F43F5E", icon: Lock, title: "Military Vault", span: "col-span-1", desc: "AES-256 encryption. Your data is your fortress." },
  { id: 6, color: "#6366F1", icon: History, title: "Anti-Theft Journal", span: "col-span-2", desc: "Every price change and deleted transaction is logged. Complete transparency for owners to prevent internal fraud." },
];

export default function Features() {
  return (
    <section style={{ 
      padding: '80px 8%', 
      background: '#020617', 
      position: 'relative', 
      overflow: 'hidden'
    }}>
      {/* Background Ambience */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '600px', background: 'radial-gradient(circle, rgba(37, 99, 235, 0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* SECTION HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#3B82F6', fontWeight: 800, fontSize: '10px', letterSpacing: '2.5px', background: 'rgba(59, 130, 246, 0.08)', padding: '6px 16px', borderRadius: '30px', marginBottom: '20px', border: '1px solid rgba(59, 130, 246, 0.2)' }}
        >
          <Zap size={12} fill="#3B82F6" /> THE ECOSYSTEM
        </motion.div>
        <h2 style={{ color: 'white', fontSize: '48px', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1 }}>
          Everything you need <br/> to <span style={{ color: '#3B82F6' }}>Dominate.</span>
        </h2>
      </div>

      {/* BENTO CLUSTER GRID */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gridAutoRows: 'minmax(220px, auto)',
        gap: '20px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        position: 'relative',
        zIndex: 5
      }}>
        {FEATURE_DATA.map((feat) => (
          <FeatureCard key={feat.id} data={feat} />
        ))}
      </div>
    </section>
  );
}

const FeatureCard = ({ data }: { data: typeof FEATURE_DATA[0] }) => {
  const isLarge = data.span === "col-span-2";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      style={{
        gridColumn: isLarge ? 'span 2' : 'span 1',
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '32px',
        padding: '35px',
        display: 'flex',
        flexDirection: isLarge ? 'row' : 'column',
        alignItems: isLarge ? 'center' : 'flex-start',
        gap: '25px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.4s ease'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${data.color}40`)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)')}
    >
      {/* Spotlight Effect behind Icon */}
      <div style={{ 
        position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '100%', 
        background: `radial-gradient(circle, ${data.color}10 0%, transparent 70%)`, 
        pointerEvents: 'none' 
      }} />

      {/* Floating Icon */}
      <motion.div 
        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
        style={{ 
          width: '56px', height: '56px', borderRadius: '16px', 
          background: `linear-gradient(135deg, ${data.color}20, ${data.color}05)`, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${data.color}30`,
          flexShrink: 0,
          boxShadow: `0 10px 20px -5px ${data.color}20`
        }}>
        <data.icon size={26} color={data.color} />
      </motion.div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 800, margin: 0 }}>
                {data.title}
            </h3>
            {data.badge && (
                <span style={{ fontSize: '9px', fontWeight: 900, background: data.color, color: 'white', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>
                    {data.badge}
                </span>
            )}
        </div>
        <p style={{ color: '#94A3B8', fontSize: '15px', lineHeight: '1.6', margin: 0, maxWidth: isLarge ? '85%' : '100%' }}>
          {data.desc}
        </p>
      </div>

      {/* Subtle indicator arrow for large cards */}
      {isLarge && (
        <div style={{ opacity: 0.3 }}>
           <Zap size={20} color={data.color} />
        </div>
      )}
    </motion.div>
  );
};