import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Product } from '../hooks/useInventorySync';

interface Props {
  type: 'ADJUST' | 'DATE';
  product: Product;
  onClose: () => void;
  onConfirm: (val: any) => void;
}

export const StockAlertModal: React.FC<Props> = ({ type, product, onClose, onConfirm }) => {
  const [val, setVal] = useState<string>('');

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="bg-slate-100 px-4 py-3 border-b flex justify-between items-center">
          <h3 className="font-bold text-slate-800">{type === 'ADJUST' ? 'Adjust Stock' : 'Set Restock Date'}</h3>
          <button onClick={onClose}><X size={18} className="text-slate-500"/></button>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-slate-600">
            {type === 'ADJUST' 
              ? `Manually add/remove stock for ${product.name}.` 
              : `When should we remind you to buy more ${product.name}?`}
          </p>
          
          <input 
            type={type === 'ADJUST' ? 'number' : 'date'}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={type === 'ADJUST' ? '+/- Quantity' : ''}
            autoFocus
            onChange={(e) => setVal(e.target.value)}
          />
          
          <button 
            onClick={() => { onConfirm(val); onClose(); }}
            className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
};