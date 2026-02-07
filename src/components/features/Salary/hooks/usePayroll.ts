import { useState, useMemo } from 'react';

export interface Employee {
  id: string;
  name: string;
  role: string;
  fayda: string; // National ID
  gross: number;
  deductions: number;
  net: number;
  status: 'Paid' | 'Pending';
}

const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Abebe Bikila', role: 'Senior Developer', fayda: '1234-5678', gross: 50000, deductions: 12500, net: 37500, status: 'Paid' },
  { id: '2', name: 'Tirunesh Dibaba', role: 'Manager', fayda: '9876-5432', gross: 65000, deductions: 18000, net: 47000, status: 'Pending' },
  { id: '3', name: 'Derartu Tulu', role: 'Accountant', fayda: '4567-8901', gross: 25000, deductions: 4500, net: 20500, status: 'Paid' },
];

export const usePayroll = () => {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  // --- Auto-Calculate Ethiopian Tax (Simplified for MVP) ---
  // In a real app, this would be a separate utility function file
  const calculateNet = (gross: number) => {
    const pension = gross * 0.07;
    const taxable = gross - pension;
    let tax = 0;
    
    // Simple bracket logic (Approximation of ERCA)
    if (taxable > 10900) tax = (taxable * 0.35) - 1500;
    else if (taxable > 7800) tax = (taxable * 0.30) - 955;
    else if (taxable > 5250) tax = (taxable * 0.25) - 565;
    
    return {
      deductions: Math.round(pension + tax),
      net: Math.round(gross - (pension + tax))
    };
  };

  const addEmployee = (data: any) => {
    const { deductions, net } = calculateNet(Number(data.gross));
    const newEmp: Employee = {
      id: Date.now().toString(),
      name: data.name,
      role: data.role,
      fayda: data.fayda,
      gross: Number(data.gross),
      deductions,
      net,
      status: 'Pending'
    };
    setEmployees(prev => [...prev, newEmp]);
  };

  const payEmployee = (id: string) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: 'Paid' } : e));
  };

  // --- KPI Math ---
  const stats = useMemo(() => {
    const totalGross = employees.reduce((acc, curr) => acc + curr.gross, 0);
    const totalNet = employees.reduce((acc, curr) => acc + curr.net, 0);
    const totalTax = employees.reduce((acc, curr) => acc + curr.deductions, 0);
    const pendingCount = employees.filter(e => e.status === 'Pending').length;
    
    return { totalGross, totalNet, totalTax, pendingCount };
  }, [employees]);

  return { employees, stats, addEmployee, payEmployee };
};