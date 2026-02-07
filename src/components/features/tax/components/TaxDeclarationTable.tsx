import React from 'react';
import { Download } from 'lucide-react';
import { Transaction } from '../../../../types';

interface Props {
  transactions: Transaction[];
}

export const TaxDeclarationTable: React.FC<Props> = ({ transactions }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800">Transaction Audit Trail</h3>
        <button className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">
          <Download size={14}/> Download ERCA CSV
        </button>
      </div>
      
      <div className="overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-white text-xs text-slate-500 uppercase font-bold tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Ref ID</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3 text-right">Base Amount</th>
              <th className="px-6 py-3 text-right">VAT (15%)</th>
              <th className="px-6 py-3 text-center">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.map((t, idx) => {
              const amount = Math.abs(Number(t.amount));
              const vat = amount * 0.15;
              
              return (
                <tr key={t.id || idx} className="hover:bg-slate-50/80">
                  <td className="px-6 py-3 font-mono text-sm text-slate-500">
                    {new Date(t.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-slate-400">
                    {t.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-slate-700">
                    {t.motif}
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-sm text-slate-600">
                    {amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-sm text-slate-400">
                    {vat.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${t.type === 'INCOME' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                      {t.type}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};