// src/views/dashboard/DashboardMain.tsx
import React from 'react';

// Context & Translations (Up two levels to src, then into context/i18n)
import { useLedger } from '../../context/LedgerContext';
import { translations } from '../../i18n/translations';

// Layout (Up two levels to src, then into components/layout)
import DashboardLayout from '../../components/layout/DashboardLayout';

// Feature Components (Up two levels to src, then into components/features/...)
import BusinessCommandCenter from '../../components/features/dashboard/BusinessCommandCenter';
import MoneyFlow from '../../components/features/money-flow/MoneyFlow'; 
import BillsInvoices from '../../components/features/invoices/BillsInvoices'; 
import TaxTracker from '../../components/features/tax/TaxTracker';
import FinalReport from '../../components/features/report/FinalReport';
import Contact from '../../components/features/contacts/Contact';

const DashboardMain: React.FC = () => {
  const { activeTab, language, transactions } = useLedger();

  const renderContent = () => {
    switch(activeTab) {
      case 'general-table': return <BusinessCommandCenter />;
      case 'money-flow': return <MoneyFlow />;
      case 'bills': return <BillsInvoices />;
      case 'tax': return <TaxTracker />;
      case 'report': return <FinalReport />;
      case 'contact': return <Contact lang={'en'} />;
      default: return <BusinessCommandCenter />;
    }
  };

  return (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  );
};

export default DashboardMain;