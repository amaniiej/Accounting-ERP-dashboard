import React from 'react';
import { CheckCircle, Clock, Trash2, User } from 'lucide-react';
import { Task, EMPLOYEES } from '../hooks/useTaskBoard';

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskListView: React.FC<Props> = ({ tasks, onToggle, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="divide-y divide-slate-100">
        {tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No tasks found.</div>
        ) : (
          tasks.map(task => {
            const assignee = EMPLOYEES.find(e => e.id === task.assignedTo[0]);
            return (
              <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50 group transition-colors">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => onToggle(task.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-transparent hover:border-blue-500'}`}
                  >
                    <CheckCircle size={14} fill="currentColor" />
                  </button>
                  
                  <div>
                    <h4 className={`font-bold text-slate-800 ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><Clock size={12}/> {task.endDate}</span>
                      {assignee && <span className="flex items-center gap-1"><User size={12}/> {assignee.name}</span>}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase`} style={{ backgroundColor: `${task.color}20`, color: task.color }}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <button onClick={() => onDelete(task.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};