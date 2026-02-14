import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './views/marketing/LandingPage';
import LoginPage from './views/auth/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';

// Features
import BusinessCommandCenter from './features/dashboard/BusinessCommandCenter';
import MoneyFlow from './features/money-flow/MoneyFlow'; // We will create this folder
import Inventory from './features/Inventory/inventory';
// ... other imports

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* Redirect /dashboard to /dashboard/home */}
        <Route index element={<Navigate to="home" replace />} />
        
        <Route path="home" element={<BusinessCommandCenter />} />
        <Route path="money-flow" element={<MoneyFlow />} />
        <Route path="inventory" element={<Inventory />} />
        {/* Add more routes here as we refactor them */}
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;