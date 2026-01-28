// src/views/marketing/components/Hero.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, CheckCircle } from 'lucide-react';

export default function Hero({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section style={{
      height: '100vh', width: '100%', display: 'grid', gridTemplateColumns: '1.2fr 1fr',
      alignItems: 'center', padding: '0 8%', gap: '40px', position: 'relative'
    }}>
      {/* Background Glow */}
      <div style={{ position: 'absolute', top: '30%', left: '10%', width: '400px', height: '400px', background: '#2563EB', filter: 'blur(150px)', opacity: 0.15, zIndex: -1 }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3B82F6', fontWeight: 800, fontSize: '11px', letterSpacing: '2px', marginBottom: '10px' }}>
          <Zap size={14} fill="#3B82F6" /> SECURE FINANCIAL TERMINAL
        </div>
        
        <h1 style={{ fontSize: '72px', fontWeight: 900, color: 'white', lineHeight: '1.1', letterSpacing: '-3px', marginBottom: '10px' }}>
          Master Your <br/>Business Finance.
        </h1>
        
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#3B82F6', marginBottom: '30px', opacity: 0.9 }}>
          ERCA-Compliant.
        </h2>

        <p style={{ fontSize: '18px', color: '#94A3B8', lineHeight: '1.6', marginBottom: '40px', maxWidth: '500px' }}>
          Consolidate Telebirr, CBE, and Cash transactions into a single legal ledger. 
          The only ERP built specifically for the Ethiopian tax landscape.
        </p>

        {/* --- STRONG BLUE GLOWING BUTTON --- */}
        <motion.button 
          whileHover={{ 
            scale: 1.05, 
            boxShadow: '0 0 40px rgba(37, 99, 235, 0.7)',
            filter: 'brightness(1.1)' 
          }}
          whileTap={{ scale: 0.98 }}
          onClick={onGetStarted}
          style={{ 
            padding: '18px 40px', 
            background: '#2563EB', 
            color: 'white', 
            border: 'none', 
            borderRadius: '15px', 
            fontSize: '18px', 
            fontWeight: 800, 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)', 
            transition: '0.3s'
          }}
        >
          Get Started Free 
          <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ArrowRight size={20} />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Right Visual: 3D Tilt Dashboard */}
      <motion.div
        whileHover={{ rotateY: -12, rotateX: 5, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 100 }}
        style={{ position: 'relative', cursor: 'crosshair', perspective: '1000px' }}
      >
        <div style={{
          background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '40px',
          padding: '40px', boxShadow: '0 50px 100px rgba(0,0,0,0.6)',
          transform: 'rotateY(-10deg)'
        }}>
           <div style={{ display:'flex', gap:'15px', marginBottom:'30px' }}>
              <div style={{ width:'12px', height:'12px', borderRadius:'50%', background:'#FF5F56' }} />
              <div style={{ width:'12px', height:'12px', borderRadius:'50%', background:'#FFBD2E' }} />
              <div style={{ width:'12px', height:'12px', borderRadius:'50%', background:'#27C93F' }} />
           </div>
           <div style={{ height:'180px', background:'rgba(255,255,255,0.02)', borderRadius:'20px', border:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ textAlign:'center' }}>
                 <div style={{ color:'#94A3B8', fontSize:'12px', fontWeight:700, letterSpacing:'1px' }}>MONTHLY REVENUE</div>
                 <div style={{ color:'white', fontSize:'42px', fontWeight:900 }}>ETB 142,500</div>
              </div>
           </div>
        </div>
        
        {/* Floating Success Pill */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          style={{ position: 'absolute', bottom: '-20px', left: '-20px', background: '#10B981', padding: '15px 25px', borderRadius: '20px', color: 'white', fontWeight: 800, fontSize: '14px', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)', display:'flex', alignItems:'center', gap:'10px' }}
        >
          <CheckCircle size={18} /> Legal Audit Verified
        </motion.div>
      </motion.div>
    </section>
  );
}