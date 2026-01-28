// src/views/marketing/components/CTA.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function CTA({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section style={{ padding: '40px 8%' }}>
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '32px',
          padding: '40px 60px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr', // Split text left, graphic right
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '280px' // Low height as requested
        }}
      >
        {/* --- LEFT SIDE: CONTENT --- */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#3B82F6', marginBottom: '15px' }}>
             <Zap size={18} fill="#3B82F6" />
             <span style={{ fontWeight: 800, fontSize: '12px', letterSpacing: '2px' }}>FOUNDER'S EARLY ACCESS</span>
          </div>

          <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'white', marginBottom: '15px', letterSpacing: '-1px' }}>
            Ready to secure your <br/>business future?
          </h2>
          
          <p style={{ color: '#94A3B8', fontSize: '15px', marginBottom: '30px', maxWidth: '450px', lineHeight: '1.6' }}>
            Join 10 exclusive "Founding Partners" this month and lock in a 50% lifetime discount on our Business Plan.
          </p>

          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: '#1d4ed8', boxShadow: '0 0 30px rgba(37, 99, 235, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onGetStarted}
            style={{ 
              padding: '14px 30px', background: '#2563EB', color: 'white', border: 'none', 
              borderRadius: '12px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', 
              display: 'flex', alignItems: 'center', gap: '10px' 
            }}
          >
            Get Started Now <ArrowRight size={18} />
          </motion.button>
        </div>

        {/* --- RIGHT SIDE: RELATED GRAPHIC (Abstract Pulse) --- */}
        <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Background Glow */}
            <div style={{ position: 'absolute', width: '200px', height: '200px', background: '#2563EB', filter: 'blur(80px)', opacity: 0.2 }} />
            
            {/* Animated Data Rings */}
            {[1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.3, 0.1],
                        rotate: i % 2 === 0 ? 360 : -360
                    }}
                    transition={{ 
                        duration: 8 / i, 
                        repeat: Infinity, 
                        ease: "linear" 
                    }}
                    style={{
                        position: 'absolute',
                        width: `${100 + (i * 40)}px`,
                        height: `${100 + (i * 40)}px`,
                        border: '1px dashed rgba(37, 99, 235, 0.3)',
                        borderRadius: '50%'
                    }}
                />
            ))}

            {/* Central Icon */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ 
                    position: 'relative', zIndex: 3, background: 'white', 
                    padding: '20px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' 
                }}
            >
                <ShieldCheck size={40} color="#2563EB" />
            </motion.div>
        </div>

      </div>
    </section>
  );
}