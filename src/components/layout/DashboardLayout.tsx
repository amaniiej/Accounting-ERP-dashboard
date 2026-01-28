// src/components/layout/DashboardLayout.tsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<LayoutProps> = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const styles: Record<string, React.CSSProperties> = {
    container: { 
      display: 'flex', 
      flexDirection: 'row', 
      height: '100vh', 
      width: '100vw',
      background: '#F8FAFC', 
      overflow: 'hidden', 
      position: 'relative' 
    },
    mainArea: { 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      padding: '10px 15px 10px 5px', // Tighter padding: Top, Right, Bottom, Left
      position: 'relative', 
      zIndex: 10,
      minWidth: 0,
      overflow: 'hidden'
    },
    contentCard: { 
      flex: 1, 
      background: 'rgba(255, 255, 255, 0.4)', 
      backdropFilter: 'blur(24px) saturate(180%)', 
      borderRadius: '24px', // Slightly sharper corners for a more "pro" look
      padding: '20px', // Reduced from 30px
      overflowY: 'auto',
      border: '1px solid rgba(255,255,255,0.8)',
    },
    aurora: { position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }
  };

  return (
    <div style={styles.container}>
      <style>{`
        .orb { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.3; pointer-events: none; }
      `}</style>

      {/* Aurora Orbs */}
      <div style={styles.aurora}>
        <div className="orb" style={{ top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: '#60A5FA' }} />
        <div className="orb" style={{ bottom: '-10%', right: '-10%', width: '40vw', height: '40vw', background: '#BFDBFE' }} />
      </div>

      <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

      <div style={styles.mainArea}>
        <Header />
        <div style={styles.contentCard}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;