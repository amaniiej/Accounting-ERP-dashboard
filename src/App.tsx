import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './views/auth/LoginPage';
import LandingPage from './views/marketing/LandingPage';
import { useAuth } from './context/LedgerContext';

// Lazy Load Pages
const BusinessCommandCenter = lazy(() => import('./components/features/dashboard/BusinessCommandCenter'));
const MoneyFlow = lazy(() => import('./components/features/money-flow/MoneyFlow'));
const Inventory = lazy(() => import('./components/features/Inventory/inventory'));
const TaxTracker = lazy(() => import('./components/features/tax/TaxTracker'));
const Reports = lazy(() => import('./components/features/report/FinalReport'));
const SalaryPayroll = lazy(() => import('./components/features/Salary/salarypayroll'));
const ActivityManagement = lazy(() => import('./components/features/Activity/activitymanagement'));
const VaultMain = lazy(() => import('./components/features/vault/VaultMain')); // Lazy import

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const App = () => {
  const { isAuthenticated, login } = useAuth();
  const [showLanding, setShowLanding] = React.useState(true);

  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage onLogin={login} onBackToMarketing={() => setShowLanding(true)} />
        } />

        <Route path="vault" element={<VaultMain />} />
        <Route path="/" element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<BusinessCommandCenter />} />
          <Route path="money-flow" element={<MoneyFlow />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="tax" element={<TaxTracker />} />
          <Route path="reports" element={<Reports />} />
          <Route path="payroll" element={<SalaryPayroll />} />
          <Route path="activity" element={<ActivityManagement />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};

export default App;