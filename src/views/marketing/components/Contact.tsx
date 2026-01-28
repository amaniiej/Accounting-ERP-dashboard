// src/views/marketing/components/Contact.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Zap } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  // --- STYLES ---
  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 800,
    color: '#3B82F6',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    marginBottom: '10px',
    display: 'block'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '12px 0',
    color: 'white',
    fontSize: '16px',
    outline: 'none',
    transition: '0.3s border-color',
  };

  const infoItemStyle: React.CSSProperties = {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    marginBottom: '30px'
  };

  return (
    <section style={{ padding: '60px 8%', position: 'relative' }}>
      {/* SECTION HEADER */}
      <div style={{ marginBottom: '60px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#3B82F6', fontWeight: 800, fontSize: '10px', letterSpacing: '2px', marginBottom: '15px' }}>
           <MessageSquare size={14} fill="#3B82F6" /> DIRECT LINE
        </div>
        <h2 style={{ fontSize: '42px', fontWeight: 900, color: 'white', letterSpacing: '-2px', margin: 0 }}>
          Let’s talk <span style={{ color: '#2563EB' }}>Business.</span>
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '80px' }}>
        
        {/* --- LEFT SIDE: INFO --- */}
        <div>
          <p style={{ color: '#94A3B8', fontSize: '18px', lineHeight: '1.6', marginBottom: '50px' }}>
            Have a specific requirement for your branch? Or need a custom enterprise integration? Our team is ready to scale with you.
          </p>

          <div style={infoItemStyle}>
            <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '12px', borderRadius: '12px' }}>
              <Mail size={20} color="#3B82F6" />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>EMAIL US</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>support@accounting-erp.et</div>
            </div>
          </div>

          <div style={infoItemStyle}>
            <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '12px', borderRadius: '12px' }}>
              <Phone size={20} color="#3B82F6" />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>CALL DIRECT</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>+251 911 00 00 00</div>
            </div>
          </div>

          <div style={infoItemStyle}>
            <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '12px', borderRadius: '12px' }}>
              <MapPin size={20} color="#3B82F6" />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>HEADQUARTERS</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>Bole, Addis Ababa, Ethiopia</div>
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: FORM --- */}
        <div style={{ position: 'relative' }}>
          {/* Subtle Glow behind the form to give it focus without a box */}
          <div style={{ position: 'absolute', top: '0', right: '0', width: '300px', height: '300px', background: '#2563EB', filter: 'blur(150px)', opacity: 0.05, zIndex: 0 }} />

          <form style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input 
                  style={inputStyle} 
                  placeholder="full name" 
                  onFocus={(e) => e.target.style.borderBottomColor = '#2563EB'}
                  onBlur={(e) => e.target.style.borderBottomColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input 
                  style={inputStyle} 
                  placeholder="example@gmail.com" 
                  onFocus={(e) => e.target.style.borderBottomColor = '#2563EB'}
                  onBlur={(e) => e.target.style.borderBottomColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <label style={labelStyle}>Your Message</label>
              <textarea 
                style={{ ...inputStyle, minHeight: '100px', resize: 'none' }} 
                placeholder="How can we help your business scale?" 
                onFocus={(e) => e.target.style.borderBottomColor = '#2563EB'}
                onBlur={(e) => e.target.style.borderBottomColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(37, 99, 235, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: '#2563EB',
                color: 'white',
                border: 'none',
                padding: '18px 40px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              SEND MESSAGE <Send size={18} />
            </motion.button>
          </form>
        </div>

      </div>
    </section>
  );
}