import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar, List } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

// Imports
import { useTaskBoard } from './hooks/useTaskBoard';
import { CalendarView } from './components/CalendarView';
import { TaskListView } from './components/TaskListView';
import { TaskFormModal } from './components/TaskFormModal';

const ActivityManagement = () => {
  // 1. Logic Hook
  const { 
    tasks, currentMonth, viewMode, isEthCalendar, daysInMonth,
    setViewMode, setIsEthCalendar, navigateMonth, 
    addTask, deleteTask, toggleStatus, toEthiopianDate 
  } = useTaskBoard();

  // 2. UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  return (
    <div className="h-full flex flex-col gap-6 relative">
      
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Month Navigation */}
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <button onClick={() => navigateMonth('prev')} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft size={20}/></button>
            <button onClick={() => navigateMonth('next')} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight size={20}/></button>
          </div>
          <h2 className="text-xl font-black text-slate-800">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setViewMode('calendar')} className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}><Calendar size={18}/></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}><List size={18}/></button>
          </div>
          
          <button 
            onClick={() => setIsEthCalendar(!isEthCalendar)}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${isEthCalendar ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-600 border-slate-200'}`}
          >
            {isEthCalendar ? '📅 Ethiopian' : '📅 Gregorian'}
          </button>

          <button 
            onClick={() => { setSelectedDate(new Date()); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 transition-all"
          >
            <Plus size={18} /> New Task
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        {viewMode === 'calendar' ? (
          <CalendarView 
            days={daysInMonth} 
            tasks={tasks} 
            currentMonth={currentMonth}
            isEth={isEthCalendar}
            toEth={toEthiopianDate}
            onDayClick={(date) => { setSelectedDate(date); setIsModalOpen(true); }}
          />
        ) : (
          <TaskListView 
            tasks={tasks} 
            onToggle={toggleStatus} 
            onDelete={deleteTask} 
          />
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <TaskFormModal 
            initialDate={selectedDate}
            onClose={() => setIsModalOpen(false)} 
            onSave={addTask} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActivityManagement;