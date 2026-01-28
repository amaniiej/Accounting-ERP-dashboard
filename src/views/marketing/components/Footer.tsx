// src/views/marketing/components/Footer.tsx
import React from 'react';
import { ShieldCheck, Facebook, Twitter, Linkedin, Globe } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ padding: '80px 8% 40px', background: '#020617', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 2 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '50px', marginBottom: '60px' }}>
        
        {/* Brand Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '22px', fontWeight: 900 }}>
            <ShieldCheck size={32} color="#2563EB" /> Accounting ERP
          </div>
          <p style={{ color: '#64748B', fontSize: '14px', lineHeight: '1.6' }}>
            Building the financial backbone for the modern Ethiopian enterprise. Secure, compliant, and lightning-fast.
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
            {[Facebook, Twitter, Linkedin].map((Icon, i) => (
              <div key={i} style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                <Icon size={18} color="#94A3B8" />
              </div>
            ))}
          </div>
        </div>

        {/* Links Columns */}
        {[
          { title: 'Product', links: ['Features', 'Integrations', 'Pricing', 'Vault'] },
          { title: 'Company', links: ['About Us', 'Contact', 'Compliance', 'Security'] },
          { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] }
        ].map((col, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'white' }}>{col.title}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {col.links.map(link => (
                <span key={link} style={{ color: '#64748B', fontSize: '14px', cursor: 'pointer', transition: '0.2s' }}>{link}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#475569' }}>
        <div>© {currentYear} Accounting ERP Dashboard. All rights reserved.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={14} /> Addis Ababa, Ethiopia</span>
        </div>
      </div>
    </footer>
  );
}