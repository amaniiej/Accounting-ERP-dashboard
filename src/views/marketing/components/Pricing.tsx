// src/views/marketing/components/Pricing.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Building2, Wallet, Sparkles } from 'lucide-react';

const PriceCard = ({ title, price, desc, features, outcome, isPopular, isEnterprise, onGetStarted }: any) => (
  <motion.div
    whileHover={{ y: -12 }}
    style={{
      flex: 1, minWidth: '300px', padding: '40px', borderRadius: '28px',
      background: isEnterprise 
        ? 'linear-gradient(145deg, rgba(20, 20, 10, 0.9) 0%, rgba(2, 6, 23, 1) 100%)' 
        : 'rgba(255, 255, 255, 0.02)',
      border: isEnterprise 
        ? '1px solid #D4AF37' 
        : `1px solid ${isPopular ? '#2563EB' : 'rgba(255, 255, 255, 0.08)'}`,
      boxShadow: isEnterprise 
        ? '0 20px 60px rgba(212, 175, 55, 0.15)' 
        : isPopular ? '0 20px 40px rgba(37, 99, 235, 0.1)' : 'none',
      display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative'
    }}
  >
    {isEnterprise && (
      <div style={{ position: 'absolute', top: '20px', right: '20px', color: '#D4AF37' }}>
        <Crown size={24} />
      </div>
    )}

    <div>
      <div style={{ color: isEnterprise ? '#D4AF37' : isPopular ? '#3B82F6' : '#94A3B8', fontWeight: 800, fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontSize: '36px', fontWeight: 900, color: 'white' }}>{price}</span>
        <span style={{ fontSize: '14px', color: '#64748B' }}>ETB/mo</span>
      </div>
      <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '10px', lineHeight: '1.5' }}>{desc}</p>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
      {features.map((f: string, i: number) => (
        <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#E2E8F0', alignItems: 'flex-start' }}>
          <Check size={16} color={isEnterprise ? '#D4AF37' : '#10B981'} style={{ marginTop: '2px', flexShrink: 0 }} /> 
          {f}
        </div>
      ))}
    </div>

    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '16px', borderLeft: `4px solid ${isEnterprise ? '#D4AF37' : '#2563EB'}` }}>
       <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Outcome</span>
       <p style={{ fontSize: '13px', color: 'white', fontWeight: 600, margin: '4px 0 0 0' }}>"{outcome}"</p>
    </div>

    <button 
      onClick={onGetStarted}
      style={{
        width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
        background: isEnterprise ? 'linear-gradient(90deg, #D4AF37, #F9D976)' : isPopular ? '#2563EB' : 'white',
        color: isEnterprise || isPopular ? 'white' : '#020617',
        fontWeight: 800, cursor: 'pointer', transition: '0.3s'
      }}
    >
      {isEnterprise ? 'Contact for Onboarding' : 'Start Free Trial'}
    </button>
  </motion.div>
);

export default function Pricing({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section style={{ padding: '100px 8%' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h2 style={{ fontSize: '42px', fontWeight: 900, color: 'white' }}> Prices.</h2>
        <p style={{ color: '#94A3B8', fontSize: '18px', marginTop: '10px' }}>Scale as you grow in the Ethiopian market.</p>
      </div>

      <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', alignItems: 'stretch' }}>
        <PriceCard 
          title="Starter" price="1,999" outcome="Know exactly where your money is at 6 PM."
          desc="Perfect for shop owners wanting to eliminate staff theft and bad math."
          features={["Master Ledger (Telebirr/CBE/Cash)", "SMS Parser (The Magic Moment)", "Single User (Owner only)", "Daily Cash Position Report"]}
          onGetStarted={onGetStarted}
        />
        <PriceCard 
          isPopular title="Business" price="4,499" outcome="Be safe from tax penalties, staff paid correctly."
          desc="For growing businesses scared of ERCA audits and payroll complexity."
          features={["Everything in Starter", "Automated Pension & Income Tax", "Live VAT/TOT Liability Tracker", "Proforma & VAT Invoice PDF Gen", "Owner + 1 Accountant Access"]}
          onGetStarted={onGetStarted}
        />
        <PriceCard 
          isEnterprise title="Enterprise" price="14,999+" outcome="Manage your whole empire from your phone."
          desc="For factories, distributors, and multi-location franchises."
          features={["Multi-Branch Sync (3+ Locations)", "Asset & Equipment Registry", "AI Business Assistant (Insights)", "Audit Journal (Anti-Fraud Logs)", "A4 Official Document + QR Code"]}
          onGetStarted={onGetStarted}
        />
      </div>
    </section>
  );
}