import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSave: (data: any) => void;
}

export const ProductFormModal: React.FC<Props> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Raw Material',
    initialStock: 0,
    threshold: 0,
    sellingPrice: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">New Inventory Item</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-500"/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Product Name</label>
            <input 
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Coffee Beans"
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
              <select 
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option>Raw Material</option>
                <option>Beverage</option>
                <option>Meat</option>
                <option>Consumable</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Initial Stock</label>
              <input 
                type="number" min="0" required
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={e => setFormData({...formData, initialStock: Number(e.target.value)})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Alert Threshold</label>
              <input 
                type="number" min="0" required
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={e => setFormData({...formData, threshold: Number(e.target.value)})}
              />
            </div>
             <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Selling Price</label>
              <input 
                type="number" min="0"
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={e => setFormData({...formData, sellingPrice: Number(e.target.value)})}
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">Create Item</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};