import React, { useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

// Imports
import { usePayroll } from './hooks/usePayroll';
import { PayrollStats } from './components/PayrollStats';
import { EmployeeTable } from './components/EmployeeTable';
import { AddEmployeeModal } from './components/AddEmployeeModal';

const SalaryPayroll = () => {
  const { employees, stats, addEmployee, payEmployee } = usePayroll();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="h-full flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Payroll</h1>
          <p className="text-slate-500 text-sm">Monthly salary processing and tax deductions.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
            <Download size={16}/> Export Report
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200"
          >
            <Plus size={18}/> Add Employee
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <PayrollStats stats={stats} />

      {/* Main Table */}
      <div className="flex-1 min-h-0">
        <EmployeeTable employees={employees} onPay={payEmployee} />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <AddEmployeeModal onClose={() => setIsModalOpen(false)} onSave={addEmployee} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SalaryPayroll;