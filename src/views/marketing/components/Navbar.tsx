// src/views/marketing/components/Navbar.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export default function Navbar({ onGetStarted }: { onGetStarted: () => void }) {
  
  // Helper to handle smooth scrolling
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { name: 'Features', id: 'features-section' },
    { name: 'Compliance', id: 'compliance-section' },
    { name: 'Pricing', id: 'pricing-section' },
    { name: 'Contact us', id: 'contact-section' },
  ];

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '15px 8%', position: 'fixed', top: 0, width: '100%', zIndex: 100,
      backdropFilter: 'blur(15px)', borderBottom: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(2, 6, 23, 0.5)'
    }}>
      {/* Clickable Logo leads back to top */}
      <div 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: 900, color: 'white', cursor: 'pointer' }}
      >
        <ShieldCheck size={28} color="#2563EB" /> Accounting ERP
      </div>

      <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
        {navLinks.map(link => (
          <motion.span 
            key={link.id} 
            whileHover={{ color: '#fff', scale: 1.05 }}
            onClick={() => scrollToSection(link.id)}
            style={{ color: '#94A3B8', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}
          >
            {link.name}
          </motion.span>
        ))}

        <motion.button 
          whileHover={{ scale: 1.05, backgroundColor: '#1d4ed8', boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onGetStarted}
          style={{ background: '#2563EB', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
        >
          Login
        </motion.button>
      </div>
    </nav>
  );
}