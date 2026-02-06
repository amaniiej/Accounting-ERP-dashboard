// src/components/features/Activity/activitymanagement.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Calendar as CalendarIcon, Clock, User, Users, 
  Bell, X, ChevronLeft, ChevronRight, Search,
  Repeat, Trash2, Edit3, Save, Send, Filter, CheckCircle,
  Printer, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Interfaces ---

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  assignedTo: string[];
  assignedRoles: string[];
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  color: string;
  notifications: boolean;
  createdAt: string;
  completedAt?: string;
}

// --- Mock Data ---

const EMPLOYEES: Employee[] = [
  { id: '1', name: 'Abebe Kebede', role: 'Manager', department: 'IT' },
  { id: '2', name: 'Sarah Tadesse', role: 'Developer', department: 'IT' },
  { id: '3', name: 'Dawit Hailu', role: 'Accountant', department: 'Finance' },
  { id: '4', name: 'Helen Girma', role: 'HR Specialist', department: 'HR' },
  { id: '5', name: 'Yonas Bekele', role: 'Sales Lead', department: 'Sales' },
];

const ROLES = ['Manager', 'Developer', 'Accountant', 'HR Specialist', 'Sales Lead'];

// --- Ethiopian Calendar Logic ---
const ETHIOPIAN_MONTHS = [
  "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit",
  "Megabit", "Miazia", "Genbot", "Sene", "Hamle", "Nehase", "Pagume"
];

const ETHIOPIAN_DAYS = [
  "Ehud", "Segno", "Maksegno", "Rob", "Hamus", "Arb", "Kidame"
];

// Simplified Ethiopian Date Converter (Approximation for UI)
const toEthiopianDate = (gregorianDate: Date) => {
  const year = gregorianDate.getFullYear();
  const month = gregorianDate.getMonth();
  const day = gregorianDate.getDate();
  
  // Basic offset calculation (approximate)
  // Ethiopian year is 7 or 8 years behind
  let ethYear = year - 8;
  
  // New year starts around Sep 11
  const newYearDate = new Date(year, 8, 11);
  if (gregorianDate >= newYearDate) {
    ethYear += 1;
  }

  // Ethiopian months are 30 days each, except Pagume
  // This is a simplified mapping for UI display
  // In a real app, use a library like 'ethiopian-date'
  
  return {
    day: day, // Placeholder for day mapping
    monthName: ETHIOPIAN_MONTHS[month],
    year: ethYear,
    dayName: ETHIOPIAN_DAYS[gregorianDate.getDay()]
  };
};

// --- Components ---

interface ActivityManagementProps {
  searchTerm?: string;
}

const ActivityManagement: React.FC<ActivityManagementProps> = ({ searchTerm: globalSearch }) => {
  // --- State Management ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('agrospace_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isEthiopianCalendar, setIsEthiopianCalendar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    assignedTo: [],
    assignedRoles: [],
    recurrence: 'none',
    priority: 'medium',
    color: '#3b82f6',
    notifications: true,
  });

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('agrospace_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // --- Calendar Logic ---
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Padding days
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  }, [currentMonth]);

  const getTasksForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      const start = new Date(task.startDate);
      const end = new Date(task.endDate);
      const check = new Date(dateStr);
      return check >= start && check <= end;
    });
  };

  // --- Handlers ---
  const handleCreateTask = () => {
    if (!formData.title || !formData.startDate || !formData.endDate) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description || '',
      startDate: formData.startDate,
      endDate: formData.endDate,
      assignedTo: formData.assignedTo || [],
      assignedRoles: formData.assignedRoles || [],
      recurrence: formData.recurrence || 'none',
      priority: formData.priority || 'medium',
      color: formData.color || '#3b82f6',
      status: 'pending',
      notifications: formData.notifications || false,
      createdAt: new Date().toISOString(),
    };
    
    setTasks([...tasks, newTask]);
    
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      assignedTo: [],
      assignedRoles: [],
      recurrence: 'none',
      priority: 'medium',
      notifications: true,
    });
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const newStatus = t.status === 'completed' ? 'pending' : 'completed';
        return {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
        };
      }
      return t;
    }));
  };

  const deleteTask = (taskId: string) => {
    if (confirm('Delete this task?')) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  // --- Render Helpers ---
  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const filteredTasks = filterRole === 'all' 
    ? tasks 
    : tasks.filter(t => t.assignedRoles.includes(filterRole) || t.assignedTo.some(id => EMPLOYEES.find(e => e.id === id)?.role === filterRole));

  const effectiveSearch = globalSearch || searchTerm;

  const searchedTasks = filteredTasks.filter(t => 
    t.title.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
    t.description.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
    t.assignedTo.some(id => EMPLOYEES.find(e => e.id === id)?.name.toLowerCase().includes(effectiveSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-white p-6" style={{ fontFamily: 'Satoshi, sans-serif' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-white/80 backdrop-blur-xl p-1 rounded-xl border border-white/50 shadow-[0_0_15px_rgba(0,0,0,0.05)]">
              <button 
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Calendar
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                List View
              </button>
            </div>

            {/* Ethiopian Calendar Toggle */}
            <button 
              onClick={() => setIsEthiopianCalendar(!isEthiopianCalendar)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${isEthiopianCalendar ? 'bg-green-600 text-white border-green-500 shadow-[0_0_15px_rgba(22,163,74,0.4)]' : 'bg-white/80 text-slate-600 border-white/50 hover:bg-white'}`}
            >
              {isEthiopianCalendar ? '📅 Ethiopian' : '📅 Gregorian'}
            </button>

            {/* Add Task Button */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:scale-105 transition-all"
            >
              <Plus size={20} />
              Add Task
            </button>
            
            {/* Print Button */}
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-3 bg-white/80 hover:bg-white text-slate-700 font-bold rounded-2xl border border-white/50 shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-all"
            >
              <Printer size={20} />
              Print
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-lg p-4 rounded-2xl border border-white/50 shadow-[0_0_15px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-600">Filter by Role:</span>
            <select 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
            />
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_0_30px_rgba(0,0,0,0.1)] overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-slate-800">
                  {isEthiopianCalendar 
                    ? `${toEthiopianDate(currentMonth).monthName} ${toEthiopianDate(currentMonth).year}` 
                    : currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-1">
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} 
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <ChevronLeft size={20} className="text-slate-600" />
                  </button>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} 
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <ChevronRight size={20} className="text-slate-600" />
                  </button>
                </div>
              </div>
              <button onClick={() => setCurrentMonth(new Date())} className="text-sm font-bold text-blue-600 hover:text-blue-700">
                Today
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 bg-slate-50">
              {(isEthiopianCalendar ? ETHIOPIAN_DAYS : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map(day => (
                <div key={day} className="p-4 text-center text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 bg-white">
              {daysInMonth.map((date, idx) => {
                const dayTasks = getTasksForDate(date).filter(t => searchedTasks.some(st => st.id === t.id));
                const isToday = date && date.toDateString() === new Date().toDateString();
                const isSelected = date && selectedDate.toDateString() === date.toDateString();
                const ethDate = date ? toEthiopianDate(date) : null;
                
                return (
                  <div key={idx} 
                    className={`min-h-[140px] p-3 border-b border-r border-slate-100 hover:bg-slate-50 transition-all duration-200 cursor-pointer relative group hover:shadow-lg hover:z-10 hover:scale-[1.05]
                      ${isToday ? 'bg-blue-50/30' : ''}
                      ${isSelected ? 'ring-2 ring-inset ring-blue-500 bg-blue-50/20' : ''}
                      ${!date ? 'bg-slate-50/30' : ''}
                    `}
                    onClick={() => date && setSelectedDate(date)}
                  >
                    {date && (
                      <>
                        <div className={`text-sm font-bold mb-2 w-8 h-8 flex items-center justify-center rounded-full
                          ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
                          {isEthiopianCalendar ? ethDate?.day : date.getDate()}
                        </div>
                        
                        {/* Dual Date Tooltip Bubble */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 w-max text-center">
                          <div className="font-bold">{date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                          <div className="text-emerald-400 font-mono">{ethDate?.dayName}, {ethDate?.day} {ethDate?.monthName} {ethDate?.year}</div>
                          <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45"></div>
                        </div>

                        <div className="space-y-1">
                          {dayTasks.slice(0, 3).map(task => (
                            <div key={task.id} 
                              className={`text-base p-3 rounded-xl font-bold truncate border shadow-md mb-2
                                ${task.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 line-through' : 
                                  task.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-200' :
                                  getPriorityColor(task.priority)}
                              `}
                            >
                              {task.title}
                            </div>
                          ))}
                          {dayTasks.length > 3 && (
                            <div className="text-base text-slate-500 font-bold pl-2 mt-2">+{dayTasks.length - 3} more...</div>
                          )}
                        </div>
                        
                        {/* Quick Add on Hover */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData({...formData, startDate: date.toISOString().split('T')[0], endDate: date.toISOString().split('T')[0]});
                            setIsModalOpen(true);
                          }}
                          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-blue-600 text-white rounded-lg shadow-lg"
                        >
                          <Plus size={14} />
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_0_30px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-800">Task List ({searchedTasks.length})</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {searchedTasks.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()).map(task => {
                const assignedNames = task.assignedTo.map(id => EMPLOYEES.find(e => e.id === id)?.name).filter(Boolean).join(', ');
                const isOverdue = task.status === 'overdue';
                
                return (
                  <div key={task.id} className={`p-6 hover:bg-slate-50 transition-all duration-200 hover:-translate-y-1 hover:shadow-sm flex items-center justify-between group
                    ${isOverdue ? 'bg-red-50/30' : ''}`}>
                    <div className="flex items-start gap-4">
                      <button 
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                          ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 
                            isOverdue ? 'border-red-400 text-red-500' : 'border-slate-300 text-slate-300 hover:border-blue-500'}`}
                      >
                        {task.status === 'completed' && <CheckCircle size={14} />}
                      </button>
                      
                      <div>
                        <h3 className={`font-bold text-slate-800 ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                          {task.title}
                          {task.recurrence !== 'none' && <Repeat size={14} className="inline ml-2 text-blue-500" />}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><CalendarIcon size={12} /> {task.startDate} → {task.endDate}</span>
                          {assignedNames && <span className="flex items-center gap-1"><User size={12} /> {assignedNames}</span>}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          {isOverdue && <span className="text-red-600 font-bold flex items-center gap-1">Overdue</span>}
                        </div>
                      </div>
                    </div>
                    
                    <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
              
              {searchedTasks.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                  <CalendarIcon size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No tasks found. Create your first task!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selected Date Tasks Preview */}
        {viewMode === 'calendar' && (
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 p-6 shadow-[0_0_20px_rgba(0,0,0,0.05)] hover:scale-[1.01] transition-transform">
            <h3 className="text-lg font-black text-slate-800 mb-4">
              Tasks for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            <div className="grid gap-3">
              {getTasksForDate(selectedDate).filter(t => searchedTasks.some(st => st.id === t.id)).length === 0 ? (
                <p className="text-slate-400 text-sm italic">No tasks scheduled for this day.</p>
              ) : (
                getTasksForDate(selectedDate).filter(t => searchedTasks.some(st => st.id === t.id)).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{task.title}</p>
                        <p className="text-xs text-slate-500">{task.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.assignedTo.map(id => {
                        const emp = EMPLOYEES.find(e => e.id === id);
                        return emp ? (
                          <div key={id} className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700" title={emp.name}>
                            {emp.name.charAt(0)}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
                <div>
                  <h2 className="text-2xl font-black text-slate-800">Create New Task</h2>
                  <p className="text-sm text-slate-500 mt-1">Assign tasks to team members with deadlines</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                {/* Title & Description */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Task Title *</label>
                    <input 
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border bor dans le der-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium"
                      placeholder="Enter task title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                      placeholder="Task details..."
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Start Date *</label>
                    <input 
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">End Date *</label>
                    <input 
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                </div>

                {/* Assignment */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <label className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Users size={18} /> Assignment
                  </label>
                  
                  {/* Role Filter */}
                  <div className="mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex">Filter by Role</span>
                    <div className="flex flex-wrap gap-2">
                      {ROLES.map(role => (
                        <div
                          key={role}
                          onClick={() => {
                            const currentRoles = formData.assignedRoles || [];
                            const newRoles = currentRoles.includes(role) 
                              ? currentRoles.filter(r => r !== role)
                              : [...currentRoles, role];
                            setFormData({...formData, assignedRoles: newRoles});
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                            ${formData.assignedRoles?.includes(role) 
                              ? 'bg-blue-600 text-white border-blue-600' 
                              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
                        >
                          {role}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Employee Selection */}
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex">Select Employees</span>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {EMPLOYEES.filter(emp => 
                        formData.assignedRoles?.length === 0 || formData.assignedRoles?.includes(emp.role)
                      ).map(emp => (
                        <label key={emp.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                          <input 
                            type="checkbox"
                            checked={formData.assignedTo?.includes(emp.id)}
                            onChange={(e) => {
                              const current = formData.assignedTo || [];
                              const updated = e.target.checked 
                                ? [...current, emp.id]
                                : current.filter(id => id !== emp.id);
                              setFormData({...formData, assignedTo: updated});
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-slate-700">{emp.name}</p>
                            <p className="text-xs text-slate-500">{emp.role}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recurrence & Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <Repeat size={16} /> Recurrence
                    </label>
                    <select 
                      value={formData.recurrence}
                      onChange={(e) => setFormData({...formData, recurrence: e.target.value as any})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                    >
                      <option value="none">No recurrence</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Priority</label>
                    <select 
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  {/* Color Selector */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Category Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({...formData, color})}
                          className={`w-8 h-8 rounded-lg transition-transform ${formData.color === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-3">
                    <Bell className="text-amber-600" size={20} />
                    <div className="flex flex-col">
                      <p className="font-bold text-amber-900 text-sm">Enable Notifications</p>
                      <p className="text-xs text-amber-700">Send reminders to assigned users</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.notifications}
                      onChange={(e) => setFormData({...formData, notifications: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateTask}
                  disabled={!formData.title || !formData.startDate || !formData.endDate}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:translate-y-[-1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <Send size={18} />
                  Create & Assign Task
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActivityManagement;