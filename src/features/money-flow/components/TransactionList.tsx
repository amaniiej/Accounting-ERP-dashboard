import React from 'react';
import { Trash2, ScrollText } from 'lucide-react';
import { Transaction } from '../../../../types';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const TransactionList: React.FC<Props> = ({ transactions, onDelete }) => {
  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-ET', { 
      style: 'currency', 
      currency: 'ETB' 
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
        <ScrollText size={20} className="text-blue-600" />
        <h3 className="font-bold text-slate-800">Daily Ledger</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
            <tr>
              <th className="p-4">Item</th>
              <th className="p-4">Category</th>
              <th className="p-4 text-right">Debit</th>
              <th className="p-4 text-right">Credit</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                  No transactions recorded yet.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-700">{tx.motif}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{new Date(tx.date).toLocaleTimeString()}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                      {tx.category || 'General'}
                    </span>
                  </td>
                  <td className="p-4 text-right text-red-600 font-mono font-bold">
                    {tx.type === 'EXPENSE' ? formatETB(Math.abs(tx.amount)) : '-'}
                  </td>
                  <td className="p-4 text-right text-emerald-600 font-mono font-bold">
                    {tx.type === 'INCOME' ? formatETB(Math.abs(tx.amount)) : '-'}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => onDelete(tx.id)} 
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};