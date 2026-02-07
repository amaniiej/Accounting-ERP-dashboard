import { useState, useMemo } from 'react';

export interface Employee {
  id: string;
  name: string;
  role: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  assignedTo: string[];
  assignedRoles: string[]; // e.g. 'Manager', 'Developer'
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  color: string;
}

// --- Mock Data ---
export const EMPLOYEES: Employee[] = [
  { id: '1', name: 'Abebe Kebede', role: 'Manager' },
  { id: '2', name: 'Sarah Tadesse', role: 'Developer' },
  { id: '3', name: 'Dawit Hailu', role: 'Accountant' },
];

const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'VAT Declaration', description: 'Submit monthly return', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], assignedTo: ['3'], assignedRoles: ['Accountant'], priority: 'high', status: 'pending', color: '#ef4444' },
  { id: 't2', title: 'Server Maintenance', description: 'Update security patches', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], assignedTo: ['2'], assignedRoles: ['Developer'], priority: 'medium', status: 'in-progress', color: '#3b82f6' },
];

// --- Ethiopian Calendar Helpers (Simplified) ---
const ETH_MONTHS = ["Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit", "Megabit", "Miazia", "Genbot", "Sene", "Hamle", "Nehase", "Pagume"];
const ETH_DAYS = ["Ehud", "Segno", "Maksegno", "Rob", "Hamus", "Arb", "Kidame"];

export const useTaskBoard = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [isEthCalendar, setIsEthCalendar] = useState(false);
  const [filterRole, setFilterRole] = useState('all');

  // --- Actions ---
  const addTask = (task: Task) => setTasks([...tasks, { ...task, id: Date.now().toString() }]);
  
  const deleteTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));
  
  const toggleStatus = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + (direction === 'next' ? 1 : -1), 1));
  };

  // --- Derived State ---
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = [];
    // Padding for empty start days
    for (let i = 0; i < new Date(year, month, 1).getDay(); i++) days.push(null);
    // Actual days
    const numDays = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= numDays; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentMonth]);

  const filteredTasks = useMemo(() => {
    if (filterRole === 'all') return tasks;
    return tasks.filter(t => t.assignedRoles.includes(filterRole));
  }, [tasks, filterRole]);

  const toEthiopianDate = (date: Date) => {
    // Simplified conversion for UI demo
    let ethYear = date.getFullYear() - 8;
    if (date.getMonth() >= 8 && date.getDate() >= 11) ethYear += 1;
    return {
      day: date.getDate(), // Placeholder mapping
      monthName: ETH_MONTHS[date.getMonth()],
      year: ethYear,
      dayName: ETH_DAYS[date.getDay()]
    };
  };

  return {
    tasks: filteredTasks,
    currentMonth,
    viewMode,
    isEthCalendar,
    filterRole,
    daysInMonth,
    setViewMode,
    setIsEthCalendar,
    setFilterRole,
    navigateMonth,
    addTask,
    deleteTask,
    toggleStatus,
    toEthiopianDate
  };
};