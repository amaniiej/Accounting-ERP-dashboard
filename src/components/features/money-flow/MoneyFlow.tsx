import React from 'react';
import { TrendingUp, TrendingDown, History } from 'lucide-react';
import { usePOS } from './hooks/usePOS';
import { POSKeypad } from './components/POSKeypad';
// We can reuse the TransactionList from another file or just map it here for simplicity in this refactor step if small.
// For now, let's keep it clean.

const MoneyFlow = () => {
  const { amount, motif, type, setMotif, setType, handleDigit, submitTransaction } = usePOS();

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* LEFT: POS INPUT */}
      <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
        {/* Toggle */}
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

        {/* Description Input */}
        <div>
          <label className="text-xs font-bold text-slate-400 ml-2 uppercase">Reason / Item</label>
          <input 
            className="w-full mt-1 p-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
            placeholder={type === 'INCOME' ? "e.g. Macchiato" : "e.g. Taxi Fare"}
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
          />
        </div>

        {/* Keypad */}
        <POSKeypad amount={amount} onDigit={handleDigit} onSubmit={submitTransaction} />
      </div>

      {/* RIGHT: Recent Feed (Placeholder for now) */}
      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 flex flex-col items-center justify-center text-slate-400">
        <History size={48} className="mb-4 opacity-20"/>
        <p className="font-bold">Recent Transactions</p>
        <p className="text-sm">Your daily feed will appear here.</p>
        {/* You can plug in your useTransactions() hook here to show the list */}
      </div>

    </div>
  );
};

export default MoneyFlow;