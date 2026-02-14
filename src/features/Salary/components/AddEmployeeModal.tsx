import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Briefcase, CreditCard, DollarSign } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSave: (data: any) => void;
}

export const AddEmployeeModal: React.FC<Props> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: '', role: '', fayda: '', gross: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const InputField = ({ icon: Icon, label, ...props }: any) => (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-2.5 text-slate-400" size={18} />
        <input {...props} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium" />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Add Employee</h2>
          <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <InputField icon={User} label="Full Name" placeholder="e.g. Abebe Bikila" value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})} required />
          <InputField icon={Briefcase} label="Role / Position" placeholder="e.g. Developer" value={formData.role} onChange={(e: any) => setFormData({...formData, role: e.target.value})} required />
          <InputField icon={CreditCard} label="Fayda ID / TIN" placeholder="0000-0000" value={formData.fayda} onChange={(e: any) => setFormData({...formData, fayda: e.target.value})} required />
          <InputField icon={DollarSign} label="Gross Salary (ETB)" type="number" placeholder="0.00" value={formData.gross} onChange={(e: any) => setFormData({...formData, gross: e.target.value})} required />
          
          <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all mt-2">
            Calculate & Add to Payroll
          </button>
        </form>
      </motion.div>
    </div>
  );
};