import React from 'react';
import { DollarSign, Wallet, PiggyBank, Users } from 'lucide-react';

interface Props {
  stats: { totalGross: number; totalNet: number; totalTax: number; pendingCount: number };
}

const Card = ({ title, value, sub, color, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      {sub && <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">{sub}</span>}
    </div>
    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
    <h3 className="text-2xl font-black text-slate-800 mt-1">
      {typeof value === 'number' ? value.toLocaleString() : value}
      {typeof value === 'number' && <span className="text-sm font-normal text-slate-400 ml-1">ETB</span>}
    </h3>
  </div>
);

export const PayrollStats: React.FC<Props> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card title="Total Payroll" value={stats.totalGross} icon={Wallet} color="bg-blue-600" />
      <Card title="Net Payable" value={stats.totalNet} icon={DollarSign} color="bg-emerald-500" />
      <Card title="Tax & Pension" value={stats.totalTax} icon={PiggyBank} color="bg-red-500" />
      <Card title="Employees" value={stats.pendingCount} sub="Pending Payment" icon={Users} color="bg-amber-500" />
    </div>
  );
};