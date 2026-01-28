// src/views/marketing/components/Compliance.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Gavel, FileLock, CheckCircle, Scale, Eye } from 'lucide-react';

const ComplianceFeature = ({ icon: Icon, title, desc }: any) => (
  <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
    <div style={{ 
      width: '40px', height: '40px', borderRadius: '10px', 
      background: 'rgba(37, 99, 235, 0.1)', display: 'flex', 
      alignItems: 'center', justifyContent: 'center', flexShrink: 0 
    }}>
      <Icon size={20} color="#3B82F6" />
    </div>
    <div>
      <h4 style={{ color: 'white', fontSize: '16px', fontWeight: 700, margin: '0 0 5px 0' }}>{title}</h4>
      <p style={{ color: '#64748B', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>{desc}</p>
    </div>
  </div>
);

export default function Compliance() {
  return (
    <section id="compliance" style={{ padding: '80px 8%', position: 'relative' }}>
      
      {/* Background Atmosphere */}
      <div style={{ position: 'absolute', top: '50%', left: '0', width: '400px', height: '400px', background: '#2563EB', filter: 'blur(150px)', opacity: 0.05, zIndex: 0 }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '60px', alignItems: 'center' }}>
        
        {/* --- LEFT SIDE: THE PROOF --- */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          style={{ position: 'relative', zIndex: 2 }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 800, fontSize: '10px', letterSpacing: '2px', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 16px', borderRadius: '30px', marginBottom: '20px' }}>
             <ShieldCheck size={14} fill="#10B981" /> GOVERNMENT READY
          </div>
          
          <h2 style={{ fontSize: '42px', fontWeight: 900, color: 'white', letterSpacing: '-2px', lineHeight: 1.1, marginBottom: '30px' }}>
            Built for the <br/> <span style={{ color: '#2563EB' }}>Ethiopian Legal Framework.</span>
          </h2>

          <ComplianceFeature 
            icon={Scale}
            title="ERCA Directive Alignment"
            desc="Our calculation engine is hard-coded to match the latest Ministry of Revenues VAT (15%) and TOT (2%) directives."
          />
          <ComplianceFeature 
            icon={FileLock}
            title="Encrypted Audit Trail"
            desc="Every transaction is cryptographically hashed. In a surprise audit, generate a verified history in under 60 seconds."
          />
          <ComplianceFeature 
            icon={Gavel}
            title="Withholding Tax Automation"
            desc="Automatically detect and withhold the required 2% for local payments over 10,000 ETB, as per legal requirements."
          />
        </motion.div>

        {/* --- RIGHT SIDE: THE VISUAL (Certification Card) --- */}
        <motion.div
          whileHover={{ rotateY: 10, rotateX: -5 }}
          style={{ 
            perspective: '1000px', 
            position: 'relative', 
            zIndex: 2,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <div style={{
            width: '100%',
            maxWidth: '400px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '32px',
            padding: '40px',
            boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
            textAlign: 'center'
          }}>
            <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{ marginBottom: '25px' }}
            >
                <ShieldCheck size={80} color="#2563EB" style={{ filter: 'drop-shadow(0 0 20px rgba(37, 99, 235, 0.4))' }} />
            </motion.div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'white', marginBottom: '10px' }}>Security Certified</h3>
            <p style={{ color: '#94A3B8', fontSize: '13px', lineHeight: '1.6', marginBottom: '30px' }}>
                Your data instance is logically isolated and encrypted using AES-256 standards.
            </p>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>STATUS</span>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#10B981' }}>● COMPLIANT</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>LAST AUDIT</span>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'white' }}>28 JAN 2026</span>
                </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}