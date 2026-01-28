// src/views/marketing/components/HowItWorks.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Link2, Rocket } from 'lucide-react';

const Step = ({ num, title, desc, icon: Icon }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ y: -8, backgroundColor: 'rgba(255,255,255,0.04)' }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      textAlign: 'center', 
      gap: '20px', 
      padding: '40px 30px', 
      background: 'rgba(255,255,255,0.02)',
      borderRadius: '40px', 
      border: '1px solid rgba(255,255,255,0.05)',
      position: 'relative',
      transition: '0.3s'
    }}
  >
    {/* The Floating Number Orb */}
    <div style={{ 
      width: '60px', 
      height: '60px', 
      borderRadius: '20px', 
      background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', 
      color: 'white', 
      fontWeight: 900, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: '22px', 
      boxShadow: '0 10px 30px rgba(37, 99, 235, 0.4)',
      transform: 'rotate(-5deg)',
      marginBottom: '10px'
    }}>
      {num}
    </div>

    <Icon size={28} color="#60A5FA" style={{ opacity: 0.8 }} />

    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
        {title}
      </h3>
      <p style={{ color: '#94A3B8', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
        {desc}
      </p>
    </div>
  </motion.div>
);

export default function HowItWorks() {
  return (
    <section style={{ padding: '60px 8%', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background "Energy" Glow */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', left: '50%', 
        transform: 'translate(-50%, -50%)', 
        width: '60%', height: '300px', 
        background: '#2563EB', 
        filter: 'blur(180px)', 
        opacity: 0.08, 
        pointerEvents: 'none' 
      }} />

      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h2 style={{ color: 'white', fontSize: '42px', fontWeight: 900, margin: '0 0 15px 0', letterSpacing: '-2px' }}>
          Onboard in 5 minutes.
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '18px', margin: 0 }}>
          Three simple steps to transform your financial operations.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
        <Step 
          num="01" 
          icon={UserPlus}
          title="Create Your Account" 
          desc="Register your enterprise with your TIN and business details to create a secure, isolated data instance." 
        />
        <Step 
          num="02" 
          icon={Link2}
          title="Bridge Your Channels" 
          desc="Seamlessly record sales, track expenses, and consolidate your business activity. Our smart interface handles the heavy lifting, ensuring every transaction is instantly captured in your master ledger." 
        />
        <Step 
          num="03" 
          icon={Rocket}
          title="Scale with Clarity" 
          desc="Access your real-time ledger, track tax risk, and generate legal reports instantly from any device." 
        />
      </div>
    </section>
  );
}