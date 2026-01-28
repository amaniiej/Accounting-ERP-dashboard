// src/views/marketing/LandingPage.tsx
import React, { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Compliance from './components/Compliance';
import ProblemSolution from './components/ProblemSolution';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import CTA from './components/CTA';
import Contact from './components/Contact';
import Footer from './components/Footer';

const LandingPage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.8,      // Reduced from 2.2 (Much faster response)
      lerp: 0.06,         // Increased from 0.03 (Tracks the wheel 3x closer)
      wheelMultiplier: 1.0, 
      smoothWheel: true,
    });

    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return (
    <motion.div 
      // THE TRANSITION: Slide out to the left
      initial={{ opacity: 0, x: 0 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }} 
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      style={{ background: '#020617', color: 'white', fontFamily: '"Inter", sans-serif', width: '100%' }}
    >
      <Navbar onGetStarted={onGetStarted} />
       <main style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column' }}>
        <Hero onGetStarted={onGetStarted} />
        
        {/* Each section now has a specific ID for the Navbar to find */}
        <div id="features-section"><Features /></div>
        <div id="compliance-section"><Compliance /></div>
        <ProblemSolution />
        <HowItWorks />
        <div id="pricing-section"><Pricing onGetStarted={onGetStarted} /></div>
        <div id="contact-section"><Contact /></div>
        
        <CTA onGetStarted={onGetStarted} />
        <Footer />
      </main>
    </motion.div>
  );
};

export default LandingPage;