import React from 'react';
import { User, CheckCircle, Clock } from 'lucide-react';
import { Employee } from '../hooks/usePayroll';

interface Props {
  employees: Employee[];
  onPay: (id: string) => void;
}

export const EmployeeTable: React.FC<Props> = ({ employees, onPay }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr className="text-xs text-slate-500 uppercase font-bold tracking-wider">
            <th className="p-4 pl-6">Employee</th>
            <th className="p-4">Role</th>
            <th className="p-4 text-right">Gross</th>
            <th className="p-4 text-right text-red-500">Tax/Pen</th>
            <th className="p-4 text-right text-emerald-600">Net Pay</th>
            <th className="p-4 text-center">Status</th>
            <th className="p-4 text-right pr-6">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {employees.map((emp) => (
            <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
              <td className="p-4 pl-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{emp.name}</p>
                    <p className="text-xs text-slate-400 font-mono tracking-tight">ID: {emp.fayda}</p>
                  </div>
                </div>
              </td>
              <td className="p-4 text-sm font-medium text-slate-600">{emp.role}</td>
              <td className="p-4 text-right font-mono text-sm text-slate-700">{emp.gross.toLocaleString()}</td>
              <td className="p-4 text-right font-mono text-sm text-red-500">-{emp.deductions.toLocaleString()}</td>
              <td className="p-4 text-right font-mono text-sm font-bold text-emerald-600">{emp.net.toLocaleString()}</td>
              <td className="p-4 text-center">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${emp.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {emp.status === 'Paid' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                  {emp.status}
                </span>
              </td>
              <td className="p-4 text-right pr-6">
                <button 
                  onClick={() => onPay(emp.id)}
                  disabled={emp.status === 'Paid'}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                  Pay Now
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};