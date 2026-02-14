import React from 'react';
import { FileText, ShieldCheck } from 'lucide-react';

// Imports
import { useTaxCalculator } from './hooks/useTaxCalculator';
import { TaxSummary } from './components/TaxSummary';
import { TaxDeclarationTable } from './components/TaxDeclarationTable';

const TaxTracker = () => {
  const { taxStats, transactions } = useTaxCalculator();

  return (
    <div className="h-full flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Tax Tracker <ShieldCheck size={20} className="text-emerald-500" />
          </h1>
          <p className="text-slate-500 text-sm">Real-time ERCA liability estimation.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
          <FileText size={18} className="text-amber-600"/>
          <div>
            <p className="text-[10px] font-bold text-amber-800 uppercase">Next Declaration</p>
            <p className="text-xs font-medium text-amber-700">Due: 30th {new Date().toLocaleString('default', { month: 'long' })}</p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <TaxSummary stats={taxStats} />

      {/* Data Table */}
      <TaxDeclarationTable transactions={transactions} />
      
    </div>
  );
};

export default TaxTracker;