import React, { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { usePOS } from './hooks/usePOS';
import POSKeypad from './components/POSKeypad';
import { TransactionList } from './components/TransactionList';
import { useTransactions } from '../../../hooks/useFinancials';

const MoneyFlow = () => {
  const { amount, motif, type, setMotif, setType, handleDigit, submitTransaction } = usePOS();
  const { data: transactions = [] } = useTransactions();
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'year'>('week');

  return (
    <div className="h-full flex flex-col gap-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT: INPUT AREA */}
        <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
          <div className="bg-slate-100 p-1 rounded-2xl flex">
            <button 
              onClick={() => setType('INCOME')} 
              className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${type === 'INCOME' ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}
            >
              <TrendingUp size={18}/> INCOME
            </button>
            <button 
              onClick={() => setType('EXPENSE')} 
              className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${type === 'EXPENSE' ? 'bg-white shadow text-red-600' : 'text-slate-500'}`}
            >
              <TrendingDown size={18}/> EXPENSE
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 ml-2 uppercase">Description</label>
            <input 
              className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" 
              placeholder="e.g. Coffee Sale..." 
              value={motif} 
              onChange={(e) => setMotif(e.target.value)} 
            />
          </div>

          <POSKeypad amount={amount} onDigit={handleDigit} onSubmit={submitTransaction} />
        </div>

        {/* RIGHT: ANALYTICS AREA */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <BarChart3 size={20} className="text-blue-500"/> Cash Flow Analytics
               </h3>
            </div>
            {/* You can add your chart component here */}
            <div className="h-48 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">
              Chart Placeholder
            </div>
          </div>
          
          <TransactionList 
            transactions={transactions.slice(0, 5)} 
            onDelete={(id) => console.log('Delete', id)} 
          />
        </div>
      </div>

    </div>
  );
};

export default MoneyFlow;