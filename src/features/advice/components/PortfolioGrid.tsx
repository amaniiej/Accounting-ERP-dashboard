import React from 'react';
import { Layers, Star, AlertTriangle, TrendingUp } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  status: string;
  margin: number;
  currentPrice: number;
}

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    'Star': 'bg-purple-100 text-purple-700 border-purple-200',
    'CashCow': 'bg-blue-100 text-blue-700 border-blue-200',
    'Problem': 'bg-orange-100 text-orange-700 border-orange-200',
    'Dog': 'bg-slate-100 text-slate-600 border-slate-200',
  }[status] || 'bg-slate-100';

  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${styles}`}>
      {status}
    </span>
  );
};

export const PortfolioGrid: React.FC<{ portfolio: Product[] }> = ({ portfolio }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Layers size={20} className="text-blue-500" /> Portfolio Health
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {portfolio.map(prod => (
          <div key={prod.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-slate-700">{prod.name}</h4>
              <StatusBadge status={prod.status} />
            </div>
            <div className="flex gap-4 text-xs text-slate-500 mt-2">
              <span className="font-medium">Margin: <span className="text-slate-900">{prod.margin}%</span></span>
              <span className="font-medium">Price: <span className="text-slate-900">{prod.currentPrice} ETB</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};