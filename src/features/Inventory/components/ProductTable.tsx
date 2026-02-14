import React from 'react';
import { Calendar, Trash2, RotateCcw } from 'lucide-react';
import { Product } from '../hooks/useInventorySync';

interface Props {
  products: Product[];
  onAdjust: (product: Product) => void;
  onEditDate: (product: Product) => void;
}

const CATEGORY_STYLES: { [key: string]: string } = {
  'Raw Material': 'bg-orange-100/80 text-orange-800 border-orange-200',
  'Beverage': 'bg-sky-100/80 text-sky-800 border-sky-200',
  'Meat': 'bg-rose-100/80 text-rose-800 border-rose-200',
  'Default': 'bg-slate-100/80 text-slate-800 border-slate-200'
};

export const ProductTable: React.FC<Props> = ({ products, onAdjust, onEditDate }) => {
  return (
    <div className="flex-1 overflow-auto bg-white rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
          <tr className="text-[10px] text-slate-500 uppercase font-bold tracking-wider border-b">
            <th className="px-6 py-4">PRODUCT NAME</th>
            <th className="px-6 py-4">CATEGORY</th>
            <th className="px-6 py-4 text-right">PRICE (ETB)</th>
            <th className="px-6 py-4 text-center">INITIAL</th>
            <th className="px-6 py-4 text-center">CONSUMED</th>
            <th className="px-6 py-4 text-right">STOCK</th>
            <th className="px-6 py-4 text-center">ACTIONS</th>
            <th className="px-6 py-4 text-center">RESTOCK DATE</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map(product => {
            const isCritical = product.availableVolume <= product.threshold;
            return (
              <tr key={product.id} className={`group hover:bg-blue-50/50 transition-colors ${isCritical ? 'bg-red-50/60' : ''}`}>
                <td className="px-6 py-4">
                  <div className="font-bold text-sm text-slate-800">{product.name}</div>
                  {isCritical && <span className="text-[9px] font-black text-red-500 uppercase animate-pulse">Critical Low</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${CATEGORY_STYLES[product.category] || CATEGORY_STYLES.Default}`}>
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-mono font-semibold text-slate-700">
                  {product.sellingPrice ? product.sellingPrice.toLocaleString() : '-'}
                </td>
                <td className="px-6 py-4 text-center text-slate-500 text-sm">{product.initialStock}</td>
                <td className="px-6 py-4 text-center text-slate-500 text-sm">{product.consumedCount}</td>
                <td className={`px-6 py-4 text-right font-black text-sm ${isCritical ? 'text-red-600' : 'text-emerald-600'}`}>
                  {product.availableVolume}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onAdjust(product)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors" title="Adjust Stock">
                      <RotateCcw size={16}/>
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded transition-colors" title="Delete">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => onEditDate(product)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    {product.reorderDate ? new Date(product.reorderDate).toLocaleDateString() : <span className="text-slate-400 italic font-normal">Set Date</span>}
                    <Calendar size={12} className="opacity-50"/>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};