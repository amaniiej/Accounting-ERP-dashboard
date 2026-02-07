import React from 'react';
import { Delete, ArrowRight } from 'lucide-react';

interface Props {
  amount: string;
  onDigit: (d: string) => void;
  onSubmit: () => void;
}

export const POSKeypad: React.FC<Props> = ({ amount, onDigit, onSubmit }) => {
  const keys = ['1','2','3','4','5','6','7','8','9','C','0','.'];

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
      <div className="mb-6 bg-slate-50 p-4 rounded-2xl text-right">
        <span className="text-sm text-slate-400 font-bold block">AMOUNT (ETB)</span>
        <span className="text-4xl font-black text-slate-800 tracking-tighter">
          {amount || '0.00'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {keys.map(k => (
          <button
            key={k}
            onClick={() => onDigit(k)}
            className={`p-4 text-xl font-bold rounded-2xl transition-all active:scale-95 ${k === 'C' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-700 hover:bg-white hover:shadow-md'}`}
          >
            {k}
          </button>
        ))}
      </div>

      <button 
        onClick={onSubmit}
        className="w-full mt-4 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all"
      >
        CONFIRM <ArrowRight />
      </button>
    </div>
  );
};