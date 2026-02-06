import React, { useState } from 'react';
import { User, Filter, Download, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data with Fayda Number
const initialEmployees = [
  { id: 'emp1', name: 'Abebe Bikila', role: 'Senior Developer', fayda: '123456789012', gross: 50000, deductions: 8500, net: 41500, status: 'Paid' },
  { id: 'emp2', name: 'Tirunesh Dibaba', role: 'Project Manager', fayda: '234567890123', gross: 65000, deductions: 11050, net: 53950, status: 'Paid' },
  { id: 'emp3', name: 'Haile Gebrselassie', role: 'UI/UX Designer', fayda: '345678901234', gross: 45000, deductions: 7650, net: 37350, status: 'Pending' },
  { id: 'emp4', name: 'Kenenisa Bekele', role: 'Junior Developer', fayda: '456789012345', gross: 30000, deductions: 5100, net: 24900, status: 'Paid' },
  { id: 'emp5', name: 'Derartu Tulu', role: 'QA Engineer', fayda: '567890123456', gross: 40000, deductions: 6800, net: 33200, status: 'Paid' },
];

const AddEmployeeModal = ({ onClose, onAddEmployee }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [fayda, setFayda] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddEmployee({
      id: `emp${Date.now()}`,
      name,
      role,
      fayda,
      gross: 0,
      deductions: 0,
      net: 0,
      status: 'Pending'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Add New Employee</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border rounded-lg" required />
          <input type="text" placeholder="Role / Position" value={role} onChange={e => setRole(e.target.value)} className="w-full p-3 border rounded-lg" required />
          <input type="text" placeholder="Fayda Number" value={fayda} onChange={e => setFayda(e.target.value)} className="w-full p-3 border rounded-lg" required />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-white font-semibold rounded-lg bg-blue-600 hover:bg-blue-700">Add Employee</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const SalaryPayroll = () => {
  const [employees, setEmployees] = useState(initialEmployees);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddEmployee = (newEmployee) => {
    setEmployees(prev => [...prev, newEmployee]);
  };

  return (
    <div className="p-1 font-sans antialiased text-slate-800 bg-slate-50">
      <AnimatePresence>
        {isModalOpen && <AddEmployeeModal onClose={() => setIsModalOpen(false)} onAddEmployee={handleAddEmployee} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800">Payroll Management</h1>
          <p className="text-slate-500">Manage and process employee salaries for the current period.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition">
            <Download size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition">
            Run Payroll ({employees.filter(e => e.status === 'Pending').length} Pending)
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div whileHover={{ scale: 1.02, y: -2 }} className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Payroll</p>
          <p className="text-3xl font-black text-slate-800 mt-2">230,000 <span className="text-xl text-slate-400">ETB</span></p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02, y: -2 }} className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Net Pay</p>
          <p className="text-3xl font-black text-green-600 mt-2">190,850 <span className="text-xl text-slate-400">ETB</span></p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02, y: -2 }} className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Taxes & Deductions</p>
          <p className="text-3xl font-black text-red-500 mt-2">39,150 <span className="text-xl text-slate-400">ETB</span></p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02, y: -2 }} className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Employees</p>
          <p className="text-3xl font-black text-slate-800 mt-2">{employees.length}</p>
        </motion.div>
      </div>

      {/* Organizational Structure */}
      <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">Organizational Structure</h3>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800">
            <Plus size={16} />
            Add Employee
          </button>
        </div>
        <p className="text-sm text-slate-500">Manage departments and employee roles.</p>
        {/* A more complex org chart could be rendered here */}
      </div>

      {/* Employee Table */}
      <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">Employee List</h3>
          <button className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800">
            <Filter size={16} />
            Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase font-semibold">
                <th className="p-4">Employee</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Gross Salary</th>
                <th className="p-4 text-right">Deductions</th>
                <th className="p-4 text-right">Net Salary</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <motion.tr key={emp.id} whileHover={{ scale: 1.01 }} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{emp.name}</p>
                        <p className="text-xs text-slate-800 font-mono">{emp.fayda}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 font-medium">{emp.role}</td>
                  <td className="p-4 text-right font-mono text-slate-600">{emp.gross.toLocaleString()} ETB</td>
                  <td className="p-4 text-right font-mono text-red-500">{emp.deductions.toLocaleString()} ETB</td>
                  <td className="p-4 text-right font-mono font-bold text-green-600">{emp.net.toLocaleString()} ETB</td>
                  <td className="p-4 text-center">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      emp.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition">
                      {emp.status === 'Paid' ? 'View Slip' : 'Pay Now'}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalaryPayroll;