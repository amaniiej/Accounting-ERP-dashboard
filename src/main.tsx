// src/main.tsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { AnimatePresence } from 'framer-motion';
import { LedgerProvider } from './context/LedgerContext';
import './index.css';

import LandingPage from './views/marketing/LandingPage';
import LoginPage from './views/auth/LoginPage';
import DashboardMain from './views/dashboard/DashboardMain';

const App = () => {
  const [currentView, setCurrentView] = useState<'marketing' | 'auth' | 'dashboard'>('marketing');

  return (
    <LedgerProvider>
      {/* THE MASTER LOCK: width 100% (not 100vw) + overflowX hidden */}
      <div style={{ 
        width: '100%', 
        minHeight: '100vh', 
        overflowX: 'hidden', 
        background: '#020617', 
        position: 'relative' 
      }}>
        <AnimatePresence mode="wait">
          {currentView === 'marketing' && (
            <LandingPage key="marketing" onGetStarted={() => setCurrentView('auth')} />
          )}

          {currentView === 'auth' && (
            <LoginPage 
              key="auth"
              onLogin={() => setCurrentView('dashboard')} 
              onBackToMarketing={() => setCurrentView('marketing')}
            />
          )}

          {currentView === 'dashboard' && (
            <DashboardMain key="dashboard" />
          )}
        </AnimatePresence>
      </div>
    </LedgerProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);