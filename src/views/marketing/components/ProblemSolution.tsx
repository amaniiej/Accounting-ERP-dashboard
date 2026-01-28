// src/views/marketing/components/ProblemSolution.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, CheckCircle2, AlertTriangle, Zap, ShieldAlert, TrendingUp, Clock, FileWarning } from 'lucide-react';

const ProblemItem = ({ title, desc }: { title: string, desc: string }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    style={{ marginBottom: '30px', display: 'flex', gap: '15px' }}
  >
    <div style={{ marginTop: '3px' }}><XCircle size={20} color="#F43F5E" /></div>
    <div>
      <h4 style={{ color: '#FEE2E2', fontSize: '18px', fontWeight: 700, margin: '0 0 5px 0' }}>{title}</h4>
      <p style={{ color: '#94A3B8', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>{desc}</p>
    </div>
  </motion.div>
);

const SolutionItem = ({ title, desc }: { title: string, desc: string }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    style={{ marginBottom: '30px', display: 'flex', gap: '15px' }}
  >
    <div style={{ marginTop: '3px' }}><CheckCircle2 size={20} color="#10B981" /></div>
    <div>
      <h4 style={{ color: '#D1FAE5', fontSize: '18px', fontWeight: 700, margin: '0 0 5px 0' }}>{title}</h4>
      <p style={{ color: '#94A3B8', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>{desc}</p>
    </div>
  </motion.div>
);

export default function ProblemSolution() {
  return (
    <section style={{ padding: '80px 8%', position: 'relative' }}>
      
      {/* SECTION HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <h2 style={{ fontSize: '48px', fontWeight: 900, color: 'white', letterSpacing: '-2px', marginBottom: '15px' }}>
          Stop Guessing. <span style={{ color: '#2563EB' }}>Start Governing.</span>
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
          We replaced manual spreadsheets and receipt boxes with an intelligent financial operating system.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.1fr 1fr', gap: '40px', alignItems: 'start' }}>
        
        {/* LEFT SIDE: THE PAIN */}
        <div style={{ paddingRight: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', color: '#F43F5E' }}>
             <ShieldAlert size={24} />
             <span style={{ fontWeight: 800, letterSpacing: '1px', fontSize: '12px', textTransform: 'uppercase' }}>Current Business Risk</span>
          </div>

          <ProblemItem 
            title="The Reconciliation Trap" 
            desc="Spending hours every night scrolling through Telebirr and CBE SMS messages to manually update your books." 
          />
          <ProblemItem 
            title="ERCA Compliance Anxiety" 
            desc="The constant fear of the 30th of the month. Manual VAT/TOT calculations are prone to errors and heavy penalties." 
          />
          <ProblemItem 
            title="Invisible Leakage" 
            desc="Small expenses and staff errors go unnoticed because you don't have a real-time pulse on your actual daily profit." 
          />
          <ProblemItem 
            title="Paper Decay" 
            desc="Physical receipts fade, get lost, or become disorganized, making you vulnerable during a surprise government audit." 
          />
        </div>

        {/* CENTRAL DIVIDER GLOW */}
        <div style={{ height: '100%', width: '1px', background: 'linear-gradient(to bottom, transparent, rgba(37, 99, 235, 0.2), transparent)', position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: '20%', width: '40px', height: '40px', borderRadius: '50%', background: '#2563EB', filter: 'blur(30px)', opacity: 0.3 }} />
            <div style={{ position: 'sticky', top: '50%', background: '#020617', padding: '10px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', color: '#2563EB', zIndex: 10, fontWeight: 900, fontSize: '12px' }}>VS</div>
        </div>

        {/* RIGHT SIDE: THE POWER */}
        <div style={{ paddingLeft: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', color: '#10B981' }}>
             <Zap size={24} fill="#10B981" />
             <span style={{ fontWeight: 800, letterSpacing: '1px', fontSize: '12px', textTransform: 'uppercase' }}>The Ledger Standard</span>
          </div>

          <SolutionItem 
            title="Magic Intake Engine" 
            desc="Just paste your bank confirmation text. Our system extracts the amount, ID, and date instantly. Bookkeeping done in seconds." 
          />
          <SolutionItem 
            title="Automated Regulatory Math" 
            desc="The ERCA engine calculates your VAT and Withholding Tax liabilities live as you sell. No more guessing, no more fines." 
          />
          <SolutionItem 
            title="Total Managerial Clarity" 
            desc="See your net profit after every sale. Monitor your margins by product and branch from your phone or office." 
          />
          <SolutionItem 
            title="Immutable Digital Vault" 
            desc="Instantly upload and compress receipts. Every record is hashed and timestamped, creating a bulletproof audit trail." 
          />
        </div>

      </div>

      {/* BOTTOM OUTCOME CARD (SUBTLE) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        style={{ 
            marginTop: '80px', textAlign: 'center', padding: '40px', 
            background: 'linear-gradient(to right, transparent, rgba(37, 99, 235, 0.03), transparent)',
            borderRadius: '40px' 
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '15px', color: '#60A5FA', fontWeight: 600 }}>
            <Clock size={20} />
            <span>Average user saves 15+ hours per week on manual accounting.</span>
        </div>
      </motion.div>

    </section>
  );
}