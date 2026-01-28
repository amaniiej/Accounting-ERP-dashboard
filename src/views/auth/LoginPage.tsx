// src/views/auth/LoginPage.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, ArrowLeft, Building2, CheckCircle2 } from 'lucide-react';

interface Props { 
  onLogin: () => void; 
  onBackToMarketing: () => void; 
}

const LoginPage: React.FC<Props> = ({ onLogin, onBackToMarketing }) => {
  const [isLogin, setIsLogin] = useState(true);

  const accentColor = "#2563EB";
  const bgDark = "#020617";

  return (
    <motion.div 
      // Transitions: Smooth slide from right, no zoom.
      initial={{ opacity: 0, x: 40 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ 
        height: '100vh', 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: bgDark,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"Inter", sans-serif'
      }}
    >
      {/* Background Glows for floating depth */}
      <div style={{ position: 'absolute', top: '15%', left: '15%', width: '400px', height: '400px', background: 'rgba(37, 99, 235, 0.08)', filter: 'blur(120px)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '15%', width: '400px', height: '400px', background: 'rgba(37, 99, 235, 0.04)', filter: 'blur(120px)', borderRadius: '50%' }} />

      {/* THE COMPACT FLOATING CARD */}
      <div 
        style={{ 
          width: '90%', 
          maxWidth: '880px', 
          height: '480px', // REDUCED HEIGHT BY 20%
          background: 'white', 
          borderRadius: '24px', 
          display: 'flex', 
          boxShadow: '0 40px 100px rgba(0, 0, 0, 0.8)',
          overflow: 'hidden',
          zIndex: 10,
          border: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        
        {/* LEFT PANEL (Dark Brand Area) */}
        <div style={{ 
          flex: 1, 
          background: `linear-gradient(145deg, ${bgDark} 0%, #0F172A 100%)`, 
          padding: '32px', 
          display: 'flex', 
          flexDirection: 'column', 
          borderRight: '1px solid rgba(255,255,255,0.05)'
        }}>
          <motion.button 
            whileHover={{ x: -4, color: '#fff' }}
            onClick={onBackToMarketing}
            style={{ 
              background: 'none', border: 'none', color: '#475569', 
              display: 'flex', alignItems: 'center', gap: '8px', 
              cursor: 'pointer', fontSize: '13px', fontWeight: 600, padding: 0
            }}
          >
            <ArrowLeft size={14} /> Site
          </motion.button>

          <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            <div style={{ 
              width: '40px', height: '40px', background: accentColor, 
              borderRadius: '10px', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', marginBottom: '20px'
            }}>
              <ShieldCheck size={24} color="white" />
            </div>
            
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: '12px' }}>
              Abyssinia <br/>Terminal.
            </h2>
            <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.5, maxWidth: '240px' }}>
              Access your secure financial <br/>dashboard and ledger.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '12px', fontWeight: 500 }}>
              <CheckCircle2 size={12} color={accentColor} /> ERCA Verified
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '12px', fontWeight: 500 }}>
              <CheckCircle2 size={12} color={accentColor} /> AES-256 Vault
            </div>
          </div>
        </div>

        {/* RIGHT PANEL (Clean Interaction Area) */}
        <div style={{ 
          flex: 1.3, 
          background: 'white', 
          padding: '40px 60px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center' 
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0F172A' }}>
                  {isLogin ? 'Sign In' : 'Register'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                  {isLogin ? 'Enter your credentials to continue' : 'Setup your company account'}
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {!isLogin && (
                  <div style={inputWrapper}>
                    <Building2 size={16} style={inputIcon} />
                    <input style={inputField} placeholder="Company Name" required />
                  </div>
                )}

                <div style={inputWrapper}>
                  <Mail size={16} style={inputIcon} />
                  <input type="email" style={inputField} placeholder="Email" required />
                </div>

                <div style={inputWrapper}>
                  <Lock size={16} style={inputIcon} />
                  <input type="password" style={inputField} placeholder="Password" required />
                </div>

                <motion.button 
                  whileHover={{ scale: 1.01, backgroundColor: '#1d4ed8' }}
                  whileTap={{ scale: 0.99 }}
                  type="submit" 
                  style={{ 
                    width: '100%', padding: '14px', background: accentColor, 
                    color: 'white', border: 'none', borderRadius: '10px', 
                    fontWeight: 700, fontSize: '14px', cursor: 'pointer', marginTop: '8px',
                    boxShadow: `0 8px 16px ${accentColor}25`
                  }}
                >
                  {isLogin ? 'AUTHENTICATE' : 'CREATE ACCOUNT'}
                </motion.button>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>
                    {isLogin ? "Need access?" : "Have an account?"}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setIsLogin(!isLogin)} 
                    style={{ 
                      background: 'none', border: 'none', color: accentColor, 
                      fontWeight: 700, fontSize: '13px', cursor: 'pointer', marginLeft: '6px' 
                    }}
                  >
                    {isLogin ? 'Register' : 'Sign in'}
                  </button>
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// Internal styles optimized for the new compact height
const inputWrapper: React.CSSProperties = { position: 'relative', width: '100%' };
const inputIcon: React.CSSProperties = { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' };
const inputField: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px 12px 42px',
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '10px',
  fontSize: '13.5px',
  outline: 'none',
  color: '#0F172A',
  transition: 'all 0.2s'
};

export default LoginPage;