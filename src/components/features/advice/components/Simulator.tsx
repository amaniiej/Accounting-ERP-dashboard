import React from 'react';
import { Zap, TrendingUp } from 'lucide-react';

interface Props {
  basePrice: number; setBase: (v: number) => void;
  margin: number; setMargin: (v: number) => void;
  result: { finalPrice: number; delta: number; isPositive: boolean };
}

export const Simulator: React.FC<Props> = ({ basePrice, setBase, margin, setMargin, result }) => {
  return (
    <div className="bg-gradient-to-br from-cyan-50/50 to-emerald-50/50 backdrop-blur-xl rounded-3xl border border-emerald-100 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-emerald-800 flex items-center gap-2 text-lg">
          <Zap size={20} className="text-emerald-500 fill-emerald-500" /> 
          Price Simulator
        </h3>
        <span className="text-[10px] font-bold bg-white/50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
          SCENARIO MODE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Base Price (ETB)</label>
            <input 
              type="number" 
              value={basePrice} 
              onChange={(e) => setBase(parseFloat(e.target.value))} 
              className="w-full mt-2 p-3 bg-white border border-emerald-100 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
              <span>Margin Adjustment</span>
              <span className="text-emerald-600">{margin > 0 ? '+' : ''}{margin}%</span>
            </div>
            <input 
              type="range" min="-20" max="100" 
              value={margin} 
              onChange={(e) => setMargin(parseInt(e.target.value))} 
              className="w-full accent-emerald-500 h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Result Card */}
        <div className="bg-white/60 rounded-2xl p-6 flex flex-col justify-center items-center text-center border border-white shadow-sm">
          <p className="text-xs font-bold text-emerald-800/50 uppercase tracking-widest mb-1">Projected Price</p>
          <div className="text-4xl font-black text-slate-800 tracking-tighter">
            {result.finalPrice} <span className="text-lg text-slate-400 font-bold">ETB</span>
          </div>
          <div className={`mt-2 flex items-center gap-1 text-sm font-bold ${result.isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
            {result.isPositive ? <TrendingUp size={16}/> : <TrendingUp size={16} className="rotate-180"/>}
            {result.isPositive ? '+' : ''}{result.delta} ETB / Unit
          </div>
        </div>
      </div>
    </div>
  );
};