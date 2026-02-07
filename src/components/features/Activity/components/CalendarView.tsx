import React from 'react';
import { Plus } from 'lucide-react';
import { Task } from '../hooks/useTaskBoard';

interface Props {
  days: (Date | null)[];
  tasks: Task[];
  currentMonth: Date;
  isEth: boolean;
  toEth: (d: Date) => any;
  onDayClick: (date: Date) => void;
}

export const CalendarView: React.FC<Props> = ({ days, tasks, currentMonth, isEth, toEth, onDayClick }) => {
  const getTasksForDate = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    return tasks.filter(t => t.startDate <= dStr && t.endDate >= dStr);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Week Header */}
      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 bg-slate-100 gap-px">
        {days.map((date, idx) => {
          if (!date) return <div key={idx} className="bg-white min-h-[140px]" />;
          
          const dayTasks = getTasksForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const ethDate = toEth(date);

          return (
            <div 
              key={idx} 
              onClick={() => onDayClick(date)}
              className={`bg-white min-h-[140px] p-2 relative group hover:bg-blue-50/30 transition-colors cursor-pointer ${isToday ? 'bg-blue-50/50' : ''}`}
            >
              {/* Date Number */}
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
                  {isEth ? ethDate.day : date.getDate()}
                </span>
                {isEth && <span className="text-[10px] text-emerald-600 font-medium">{ethDate.monthName}</span>}
              </div>

              {/* Tasks Pills */}
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map(task => (
                  <div key={task.id} className={`text-[10px] px-2 py-1 rounded border truncate font-medium ${task.status === 'completed' ? 'bg-slate-100 text-slate-400 line-through' : 'bg-white shadow-sm border-slate-200'}`} style={{ borderLeftColor: task.color, borderLeftWidth: '3px' }}>
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-[10px] text-slate-400 font-bold pl-1">+{dayTasks.length - 3} more</div>
                )}
              </div>

              {/* Quick Add Button (Hover) */}
              <button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 bg-blue-600 text-white p-1 rounded-md shadow-lg transition-opacity">
                <Plus size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};