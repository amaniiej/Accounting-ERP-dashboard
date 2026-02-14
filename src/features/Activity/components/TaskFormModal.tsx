import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, User, Tag } from 'lucide-react';
import { Task, EMPLOYEES } from '../hooks/useTaskBoard';

interface Props {
  initialDate?: Date;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export const TaskFormModal: React.FC<Props> = ({ initialDate, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    startDate: initialDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    endDate: initialDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    priority: 'medium',
    assignedTo: [],
    color: '#3b82f6'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    onSave(formData as Task);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">New Task</h2>
          <button onClick={onClose}><X size={20} className="text-slate-500 hover:text-slate-800"/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
            <input 
              autoFocus
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Task name..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input type="date" className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl outline-none" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input type="date" className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl outline-none" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assignee</label>
            <div className="flex gap-2 flex-wrap">
              {EMPLOYEES.map(emp => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => setFormData({...formData, assignedTo: [emp.id]})}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${formData.assignedTo?.includes(emp.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  {emp.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-slate-300 rounded-xl text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30">Create Task</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};