import React from 'react';
import { Scale, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';

interface Props {
  stats: {
    vatPayable: number;
    vatCredit: number;
    vatCollected: number;
    vatPaid: number;
    withholding: number;
  };
}

const Card = ({ title, value, color, icon: Icon, sub }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
    <div className={`absolute top-0 right-0 p-4 opacity-10 ${color.replace('text', 'text')}`}>
      <Icon size={40} />
    </div>
    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
    <h3 className={`text-2xl font-black ${color}`}>
      {value.toLocaleString()} <span className="text-sm font-medium text-slate-400">ETB</span>
    </h3>
    {sub && <p className="text-xs text-slate-400 mt-2">{sub}</p>}
  </div>
);

export const TaxSummary: React.FC<Props> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* 1. Net VAT Position */}
      {stats.vatPayable > 0 ? (
        <Card 
          title="VAT Payable (ERCA)" 
          value={stats.vatPayable} 
          color="text-red-600" 
          icon={Scale} 
          sub="Due by 30th of month"
        />
      ) : (
        <Card 
          title="VAT Credit" 
          value={stats.vatCredit} 
          color="text-emerald-600" 
          icon={Scale} 
          sub="Carry forward to next month"
        />
      )}

      {/* 2. VAT Collected */}
      <Card 
        title="VAT Collected (Output)" 
        value={stats.vatCollected} 
        color="text-blue-600" 
        icon={TrendingUp} 
        sub="15% on Sales"
      />

      {/* 3. VAT Paid */}
      <Card 
        title="VAT Paid (Input)" 
        value={stats.vatPaid} 
        color="text-slate-600" 
        icon={TrendingDown} 
        sub="Claimable on Expenses"
      />

      {/* 4. Withholding */}
      <Card 
        title="Withholding Tax (2%)" 
        value={stats.withholding} 
        color="text-amber-600" 
        icon={AlertCircle} 
        sub="Retained on purchases > 10k"
      />
    </div>
  );
};